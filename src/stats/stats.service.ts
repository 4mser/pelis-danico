// src/stats/stats.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from '../products/schemas/product.schema';
import { CouponDocument } from '../coupons/schemas/coupon.schema';
import { MovieDocument }  from '../movies/schemas/movie.schema';
import { Stats, StatsDocument } from './schemas/stats.schema';

@Injectable()
export class StatsService implements OnModuleInit {
  constructor(
    @InjectModel(Stats.name) private statsModel: Model<StatsDocument>,
    @InjectModel('Product') private productModel: Model<ProductDocument>,
    @InjectModel('Coupon')  private couponModel: Model<CouponDocument>,
    @InjectModel('Movie')   private movieModel: Model<MovieDocument>,
  ) {}

  onModuleInit() {
    // Recalcula cada 5 minutos
    setInterval(() => this.recalculate().catch(console.error), 1000 * 60 * 5);
  }

  /** Recalcula y guarda el documento Stats */
  async recalculate(): Promise<Stats> {
    const [
      totalProducts, totalBought, totalLiked,
      totalCoupons, totalRedeemedCoupons,
      totalMovies, totalWatched,
    ] = await Promise.all([
      this.productModel.countDocuments().exec(),
      this.productModel.countDocuments({ bought: true }).exec(),
      this.productModel.countDocuments({ likeBoth: true }).exec(),

      this.couponModel.countDocuments().exec(),
      this.couponModel.countDocuments({ redeemed: true }).exec(),

      this.movieModel.countDocuments().exec(),
      this.movieModel.countDocuments({ watched: true }).exec(),
    ]);

    const stats = await this.statsModel.findOneAndUpdate(
      {},
      {
        totalProducts, totalBought, totalLiked,
        totalCoupons, totalRedeemedCoupons,
        totalMovies, totalWatched,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    ).exec();

    return stats;
  }

  /** Obtiene las métricas actuales (sin forzar recálculo) */
  getCurrent(): Promise<Stats> {
    return this.statsModel.findOne().exec();
  }
}
