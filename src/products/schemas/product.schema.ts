// src/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  image?: string;    // ruta en disco o URL

  @Prop({ default: false })
  bought: boolean;

  @Prop({ default: false })
  likeNico: boolean;     // corazón de Nico

  @Prop({ default: false })
  likeBarbara: boolean;  // corazón de Bárbara

  @Prop({ default: false })
  likeBoth: boolean;     // corazón de Ambos (computed)
}

export const ProductSchema = SchemaFactory.createForClass(Product);
