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

  /**
   * Crea un cupón con posible expirationDate para TTL.
   */
  async addCoupon(
    title: string,
    description: string,
    owner: CouponOwner,
    reusable: boolean,
    expirationDate?: Date,
  ): Promise<Coupon> {
    if (!CouponOwners.includes(owner)) {
      throw new NotFoundException(`Owner inválido: ${owner}`);
    }
    const dto: Partial<Coupon> = { title, description, owner, reusable };
    if (expirationDate) dto.expirationDate = expirationDate;

    const coupon = await new this.couponModel(dto).save();
    this.eventEmitter.emit('pet.interaction', { type: 'addCoupon' as InteractionType });
    return coupon;
  }

  /**
   * Devuelve todos los cupones (los expirados ya
   * han sido borrados automáticamente por Mongo).
   */
  async getAllCoupons(): Promise<Coupon[]> {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async getCouponsByOwner(owner: CouponOwner): Promise<Coupon[]> {
    return this.couponModel.find({ owner }).sort({ createdAt: -1 }).exec();
  }

  async getCouponById(id: string): Promise<Coupon> {
    const c = await this.couponModel.findById(id).exec();
    if (!c) throw new NotFoundException('Coupon not found');
    return c;
  }

  /**
   * Al canjear:
   *  - reusable=false → borra de DB y devuelve { deleted: true }
   *  - reusable=true  → marca redeemed y devuelve el coupon actualizado
   * Al descanjear (redeemed=false): sólo reusable, desmarca y devuelve el coupon.
   */
  async redeemCoupon(
    id: string,
    redeemed: boolean,
  ): Promise<Coupon | { deleted: true }> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (redeemed) {
      if (coupon.reusable) {
        coupon.redeemed = true;
        const updated = await coupon.save();
        this.eventEmitter.emit('pet.interaction', { type: 'redeemCoupon' as InteractionType });
        return updated;
      } else {
        await this.couponModel.findByIdAndDelete(id).exec();
        this.eventEmitter.emit('pet.interaction', { type: 'redeemCoupon' as InteractionType });
        return { deleted: true };
      }
    } else {
      coupon.redeemed = false;
      return coupon.save();
    }
  }

  async deleteCoupon(id: string): Promise<{ deleted: true }> {
    const res = await this.couponModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Coupon not found');
    return { deleted: true };
  }
}
