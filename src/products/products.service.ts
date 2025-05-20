// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private s3: S3;
  private bucket = process.env.AWS_S3_BUCKET_NAME;
  private baseUrl = process.env.S3_BASE_URL;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private eventEmitter: EventEmitter2,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${uuidv4()}_${file.originalname}`;
    this.logger.log(`Uploading to S3: key=${key}, size=${file.size}`);
    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();
      this.logger.log(`S3 upload success: ${result.Location}`);
      return result.Location;
    } catch (err) {
      this.logger.error('S3 upload failed', (err as Error).stack);
      throw new InternalServerErrorException(
        `Error subiendo archivo a S3: ${(err as Error).message}`,
      );
    }
  }

  async create(createDto: CreateProductDto, imageFile?: Express.Multer.File) {
    this.logger.log(`create() dto=${JSON.stringify(createDto)}`);
    if (imageFile) {
      this.logger.log(
        `create() received file: ${imageFile.originalname} (${imageFile.mimetype})`,
      );
    }
    try {
      let imageUrl = createDto.imageUrl;
      if (imageFile) {
        imageUrl = await this.uploadFile(imageFile);
      }

      const product = new this.productModel({
        name: createDto.name,
        image: imageUrl,
        storeName: createDto.storeName,
        storeLink: createDto.storeLink,
      });

      const saved = await product.save();
      this.logger.log(`Product saved: id=${saved._id}`);
      this.eventEmitter.emit('pet.interaction', { type: 'addProduct' as any });
      return saved;
    } catch (err) {
      this.logger.error('Error in create()', (err as Error).stack);
      throw err;
    }
  }

  async findAll() {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) {
      this.logger.warn(`findOne() not found: id=${id}`);
      throw new NotFoundException('Product not found');
    }
    return prod;
  }

  async update(
    id: string,
    updateDto: UpdateProductDto,
    imageFile?: Express.Multer.File,
  ) {
    this.logger.log(`update() id=${id}, dto=${JSON.stringify(updateDto)}`);
    if (imageFile) {
      this.logger.log(`update() received file: ${imageFile.originalname}`);
    }

    const prod = await this.productModel.findById(id).exec();
    if (!prod) {
      this.logger.warn(`update() not found: id=${id}`);
      throw new NotFoundException('Product not found');
    }

    try {
      const wasBought = prod.bought;
      const wasLikeNico = prod.likeNico;
      const wasLikeBarbara = prod.likeBarbara;

      if (updateDto.name !== undefined) prod.name = updateDto.name;
      if (updateDto.storeName !== undefined) prod.storeName = updateDto.storeName;
      if (updateDto.storeLink !== undefined) prod.storeLink = updateDto.storeLink;

      if (updateDto.imageUrl !== undefined) {
        prod.image = updateDto.imageUrl;
      }
      if (imageFile) {
        prod.image = await this.uploadFile(imageFile);
      }

      if (updateDto.bought !== undefined) prod.bought = updateDto.bought;
      if (updateDto.likeNico !== undefined) prod.likeNico = updateDto.likeNico;
      if (updateDto.likeBarbara !== undefined) {
        prod.likeBarbara = updateDto.likeBarbara;
      }

      prod.likeBoth = prod.likeNico && prod.likeBarbara;

      const updated = await prod.save();
      this.logger.log(`Product updated: id=${updated._id}`);

      if (!wasBought && updated.bought) {
        this.eventEmitter.emit('pet.interaction', { type: 'buyProduct' as any });
      }
      const likedOneNow =
        ((!wasLikeNico && updated.likeNico) ||
          (!wasLikeBarbara && updated.likeBarbara)) &&
        !updated.likeBoth;
      if (likedOneNow) {
        this.eventEmitter.emit('pet.interaction', { type: 'likeOne' as any });
      }
      if (!(wasLikeNico && wasLikeBarbara) && updated.likeBoth) {
        this.eventEmitter.emit('pet.interaction', { type: 'likeBoth' as any });
      }

      return updated;
    } catch (err) {
      this.logger.error('Error in update()', (err as Error).stack);
      throw err;
    }
  }

  async remove(id: string) {
    this.logger.log(`remove() id=${id}`);
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) {
      this.logger.warn(`remove() not found: id=${id}`);
      throw new NotFoundException('Product not found');
    }
    this.logger.log(`Product deleted: id=${id}`);
    return { deleted: true };
  }
}
