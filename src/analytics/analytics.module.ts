import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { Movie, MovieSchema } from '../movies/schemas/movie.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}