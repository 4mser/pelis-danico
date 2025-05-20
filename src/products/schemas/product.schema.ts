import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  image?: string;    // URL en disco, en web o en S3

  @Prop({ default: false })
  bought: boolean;

  @Prop({ default: false })
  likeNico: boolean;

  @Prop({ default: false })
  likeBarbara: boolean;

  @Prop({ default: false })
  likeBoth: boolean;  // computed

  @Prop()
  storeName?: string; // nombre del local

  @Prop()
  storeLink?: string; // link de la tienda
}

export const ProductSchema = SchemaFactory.createForClass(Product);
