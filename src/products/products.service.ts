import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  private petId: string;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.petId = this.configService.get<string>('PET_ID');
  }

  async create(name: string, image?: string): Promise<Product> {
    const product = await new this.productModel({ name, image }).save();

    if (this.petId) {
      this.eventEmitter.emit('pet.interaction', {
        petId: this.petId,
        type: 'addProduct' as const,
      });
    }

    return product;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');
    return prod;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      image: string;
      bought: boolean;
      likeNico: boolean;
      likeBarbara: boolean;
    }>,
  ): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');

    // Guardar valores previos
    const wasBought     = prod.bought;
    const wasLikeNico   = prod.likeNico;
    const wasLikeBarbara= prod.likeBarbara;

    // Aplicar cambios
    if (data.name       !== undefined) prod.name        = data.name;
    if (data.image      !== undefined) prod.image       = data.image;
    if (data.bought     !== undefined) prod.bought      = data.bought;
    if (data.likeNico   !== undefined) prod.likeNico    = data.likeNico;
    if (data.likeBarbara!== undefined) prod.likeBarbara = data.likeBarbara;

    // Recalcular likeBoth
    prod.likeBoth = prod.likeNico && prod.likeBarbara;

    const updated = await prod.save();

    if (this.petId) {
      // buyProduct
      if (!wasBought && updated.bought) {
        this.eventEmitter.emit('pet.interaction', {
          petId: this.petId,
          type: 'buyProduct' as const,
        });
      }
      // likeOne (un solo like y aún no likeBoth)
      const likedOneNow = 
        ((!wasLikeNico   && updated.likeNico)   ||
         (!wasLikeBarbara&& updated.likeBarbara)) &&
        !updated.likeBoth;
      if (likedOneNow) {
        this.eventEmitter.emit('pet.interaction', {
          petId: this.petId,
          type: 'likeOne' as const,
        });
      }
      // likeBoth
      const becameLikeBoth = ! (wasLikeNico && wasLikeBarbara) && updated.likeBoth;
      if (becameLikeBoth) {
        this.eventEmitter.emit('pet.interaction', {
          petId: this.petId,
          type: 'likeBoth' as const,
        });
      }
    }

    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
