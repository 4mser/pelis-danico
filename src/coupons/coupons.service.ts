import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { InteractionType } from '../pets/pets.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addCoupon(title: string, description: string) {
    const coupon = await new this.couponModel({ title, description }).save();
    this.eventEmitter.emit('pet.interaction', { type: 'addCoupon' as InteractionType });
    return coupon;
  }

  async getAllCoupons() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async getCouponById(id: string) {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async redeemCoupon(id: string, redeemed: boolean) {
    const updated = await this.couponModel
      .findByIdAndUpdate(id, { redeemed }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Coupon not found');
    if (redeemed) {
      this.eventEmitter.emit('pet.interaction', { type: 'redeemCoupon' as InteractionType });
    }
    return updated;
  }

  async deleteCoupon(id: string) {
    const deleted = await this.couponModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Coupon not found');
    return { deleted: true };
  }
}
