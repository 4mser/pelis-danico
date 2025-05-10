// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /** Crea un producto (los corazones quedan false por defecto) */
  async create(name: string, image?: string): Promise<Product> {
    const created = new this.productModel({ name, image });
    return created.save();
  }

  /** Devuelve todos */
  async findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Devuelve uno por id */
  async findOne(id: string): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Producto no encontrado');
    return prod;
  }

  /**
   * Actualiza campos y reajusta likeBoth:
   * si likeNico && likeBarbara => likeBoth = true, sino false.
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      image: string;
      bought: boolean;
      likeNico: boolean;
      likeBarbara: boolean;
    }>
  ): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Producto no encontrado');

    // Aplicar cambios
    if (data.name !== undefined) prod.name = data.name;
    if (data.image !== undefined) prod.image = data.image;
    if (data.bought !== undefined) prod.bought = data.bought;
    if (data.likeNico !== undefined) prod.likeNico = data.likeNico;
    if (data.likeBarbara !== undefined) prod.likeBarbara = data.likeBarbara;

    // Recalcular likeBoth
    prod.likeBoth = prod.likeNico && prod.likeBarbara;

    return prod.save();
  }

  /** Borra uno */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Producto no encontrado');
    return { deleted: true };
  }
}
