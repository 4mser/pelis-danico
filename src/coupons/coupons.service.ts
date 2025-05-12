// src/coupons/coupons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  Coupon,
  CouponDocument,
  CouponOwner,
  CouponOwners,
} from './schemas/coupon.schema';
import { InteractionType } from '../pets/pets.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /** Crea y emite evento */
  async addCoupon(
    title: string,
    description: string,
    owner: CouponOwner,
  ): Promise<Coupon> {
    if (!CouponOwners.includes(owner)) {
      throw new NotFoundException(`Owner inválido: ${owner}`);
    }
    const coupon = await new this.couponModel({ title, description, owner }).save();
    this.eventEmitter.emit(
      'pet.interaction',
      { type: 'addCoupon' as InteractionType },
    );
    return coupon;
  }

  /** Todos los cupones */
  async getAllCoupons(): Promise<Coupon[]> {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Solo de un owner */
  async getCouponsByOwner(owner: CouponOwner): Promise<Coupon[]> {
    return this.couponModel
      .find({ owner })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  /** Marca como canjeado y emite evento */
  async redeemCoupon(id: string, redeemed: boolean): Promise<Coupon> {
    const updated = await this.couponModel
      .findByIdAndUpdate(id, { redeemed }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Coupon not found');
    if (redeemed) {
      this.eventEmitter.emit(
        'pet.interaction',
        { type: 'redeemCoupon' as InteractionType },
      );
    }
    return updated;
  }

  async deleteCoupon(id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.couponModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Coupon not found');
    return { deleted: true };
  }
}
