import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  /** Crea un cupón nuevo */
  async addCoupon(title: string, description: string) {
    const created = new this.couponModel({ title, description });
    return created.save();
  }

  /** Listar todos los cupones */
  async getAllCoupons() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Obtener un cupón por ID */
  async getCouponById(id: string) {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    return coupon;
  }

  /** Marcar cupón como canjeado o deshacer canje */
  async redeemCoupon(id: string, redeemed: boolean) {
    const updated = await this.couponModel
      .findByIdAndUpdate(id, { redeemed }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Cupón no encontrado');
    return updated;
  }

  /** Borrar un cupón */
  async deleteCoupon(id: string) {
    const deleted = await this.couponModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Cupón no encontrado');
    return { deleted: true };
  }
}
