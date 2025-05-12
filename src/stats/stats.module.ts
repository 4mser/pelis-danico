import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { Movie, MovieSchema } from '../movies/schemas/movie.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}