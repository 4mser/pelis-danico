import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(name: string, image: string): Promise<Product> {
    const created = new this.productModel({ name, image });
    return created.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Producto no encontrado');
    return prod;
  }

  async update(
    id: string,
    data: Partial<{ name: string; image: string; bought: boolean }>
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Producto no encontrado');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Producto no encontrado');
    return { deleted: true };
  }
}
