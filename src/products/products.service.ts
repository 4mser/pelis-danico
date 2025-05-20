import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
    try {
      await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        })
        .promise();
      return `${this.baseUrl}${key}`;
    } catch (err) {
      throw new InternalServerErrorException('Error subiendo archivo a S3');
    }
  }

  async create(createDto: CreateProductDto, imageFile?: Express.Multer.File) {
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
    this.eventEmitter.emit('pet.interaction', { type: 'addProduct' as any });
    return saved;
  }

  async findAll() {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');
    return prod;
  }

  async update(
    id: string,
    updateDto: UpdateProductDto,
    imageFile?: Express.Multer.File,
  ) {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');

    const wasBought = prod.bought;
    const wasLikeNico = prod.likeNico;
    const wasLikeBarbara = prod.likeBarbara;

    // campos básicos
    if (updateDto.name !== undefined) prod.name = updateDto.name;
    if (updateDto.storeName !== undefined) prod.storeName = updateDto.storeName;
    if (updateDto.storeLink !== undefined) prod.storeLink = updateDto.storeLink;

    // imagen por URL o subida nueva
    if (updateDto.imageUrl !== undefined) {
      prod.image = updateDto.imageUrl;
    }
    if (imageFile) {
      prod.image = await this.uploadFile(imageFile);
    }

    // flags
    if (updateDto.bought !== undefined) prod.bought = updateDto.bought;
    if (updateDto.likeNico !== undefined) prod.likeNico = updateDto.likeNico;
    if (updateDto.likeBarbara !== undefined)
      prod.likeBarbara = updateDto.likeBarbara;

    // computed
    prod.likeBoth = prod.likeNico && prod.likeBarbara;

    const updated = await prod.save();

    // eventos
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
    const becameLikeBoth = !(wasLikeNico && wasLikeBarbara) && updated.likeBoth;
    if (becameLikeBoth) {
      this.eventEmitter.emit('pet.interaction', { type: 'likeBoth' as any });
    }

    return updated;
  }

  async remove(id: string) {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
