// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Product, ProductDocument } from './schemas/product.schema';
import { InteractionType } from '../pets/pets.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /** Crea un producto y notifica curiosidad */
  async create(name: string, image?: string) {
    const product = await new this.productModel({ name, image }).save();

    this.eventEmitter.emit('pet.interaction', {
      type: 'addProduct' as InteractionType,
    });

    return product;
  }

  /** Lista todos los productos */
  async findAll() {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Obtiene uno por id */
  async findOne(id: string) {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');
    return prod;
  }

  /**
   * Actualiza el producto y emite:
   * - buyProduct si se marca bought
   * - likeOne si uno de los likes cambia y aún no son ambos
   * - likeBoth si pasa a ambos like
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      image: string;
      bought: boolean;
      likeNico: boolean;
      likeBarbara: boolean;
    }>,
  ) {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');

    // Guardamos los valores previos
    const wasBought      = prod.bought;
    const wasLikeNico    = prod.likeNico;
    const wasLikeBarbara = prod.likeBarbara;

    // Aplicamos cambios
    if (data.name        !== undefined) prod.name        = data.name;
    if (data.image       !== undefined) prod.image       = data.image;
    if (data.bought      !== undefined) prod.bought      = data.bought;
    if (data.likeNico    !== undefined) prod.likeNico    = data.likeNico;
    if (data.likeBarbara !== undefined) prod.likeBarbara = data.likeBarbara;

    // Recalculamos likeBoth
    prod.likeBoth = prod.likeNico && prod.likeBarbara;

    const updated = await prod.save();

    // Emitimos eventos según cambios
    if (!wasBought && updated.bought) {
      this.eventEmitter.emit('pet.interaction', {
        type: 'buyProduct' as InteractionType,
      });
    }

    const likedOneNow =
      ((!wasLikeNico    && updated.likeNico)    ||
       (!wasLikeBarbara && updated.likeBarbara)) &&
      !updated.likeBoth;
    if (likedOneNow) {
      this.eventEmitter.emit('pet.interaction', {
        type: 'likeOne' as InteractionType,
      });
    }

    const becameLikeBoth = !(wasLikeNico && wasLikeBarbara) && updated.likeBoth;
    if (becameLikeBoth) {
      this.eventEmitter.emit('pet.interaction', {
        type: 'likeBoth' as InteractionType,
      });
    }

    return updated;
  }

  /** Elimina un producto (sin notificar) */
  async remove(id: string) {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
