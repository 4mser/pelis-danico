// src/coupons/schemas/coupon.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CouponOwners = ['Nico', 'Barbara'] as const;
export type CouponOwner = typeof CouponOwners[number];

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: CouponOwners,
    default: 'Barbara',
  })
  owner: CouponOwner;

  @Prop({ default: false })
  redeemed: boolean;

  /** Si es true, NO se elimina al canjear */
  @Prop({ default: false })
  reusable: boolean;

  /**
   * Fecha y hora límite: cuando llegue, Mongoose/TLL
   * eliminará automáticamente el documento.
   */
  @Prop({ type: Date })
  expirationDate?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Índice TTL: expira justo al llegar a expirationDate
CouponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });
