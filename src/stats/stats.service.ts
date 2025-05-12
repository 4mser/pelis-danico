import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Coupon,
  CouponDocument,
  CouponOwner,
} from '../coupons/schemas/coupon.schema';
import { Movie, MovieDocument } from '../movies/schemas/movie.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCouponStats() {
    const coupons = await this.couponModel.find().lean().exec();
    
    const byOwner = coupons.reduce((acc, coupon) => {
      acc[coupon.owner] = (acc[coupon.owner] || 0) + 1;
      return acc;
    }, {} as Record<CouponOwner, number>);

    const byCategory = coupons.reduce((acc, coupon) => {
      const category = this.detectCouponCategory(coupon);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: coupons.length,
      redeemed: coupons.filter(c => c.redeemed).length,
      byOwner,
      byCategory,
      redemptionRate: coupons.length > 0 
        ? (coupons.filter(c => c.redeemed).length / coupons.length) * 100 
        : 0,
    };
  }

  private detectCouponCategory(coupon: Coupon): string {
    const title = coupon.title.toLowerCase();
    if (title.includes('comida') || title.includes('cena')) return 'Alimentación';
    if (title.includes('película') || title.includes('cine')) return 'Entretenimiento';
    if (title.includes('masaje') || title.includes('spa')) return 'Bienestar';
    if (title.includes('regalo') || title.includes('sorpresa')) return 'Regalos';
    return 'Otros';
  }

  async getMovieStats() {
    const movies = await this.movieModel.find().lean().exec();
    const watched = movies.filter(m => m.watched);

    const avgWatchTime = watched.length > 0
      ? watched.reduce((sum, movie) => {
          const added = new Date(movie.createdAt).getTime();
          const watchedAt = movie.watchedAt 
            ? new Date(movie.watchedAt).getTime() 
            : new Date(movie.updatedAt).getTime();
          const days = (watchedAt - added) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / watched.length
      : 0;

    return {
      total: movies.length,
      watched: watched.length,
      pending: movies.length - watched.length,
      byList: movies.reduce((acc, movie) => {
        acc[movie.list] = (acc[movie.list] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgWatchTime: Math.round(avgWatchTime * 10) / 10,
    };
  }

  async getProductStats() {
    const products = await this.productModel.find().lean().exec();
    
    return {
      total: products.length,
      likedByNico: products.filter(p => p.likeNico).length,
      likedByBarbara: products.filter(p => p.likeBarbara).length,
      likedByBoth: products.filter(p => p.likeBoth).length,
      bought: products.filter(p => p.bought).length,
    };
  }

  async getCombinedStats() {
    const [coupons, movies, products] = await Promise.all([
      this.getCouponStats(),
      this.getMovieStats(),
      this.getProductStats(),
    ]);

    return {
      coupons,
      movies,
      products,
      lastUpdated: new Date().toISOString(),
    };
  }
}