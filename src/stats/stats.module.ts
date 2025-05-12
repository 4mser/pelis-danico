// src/stats/stats.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Stats, StatsSchema } from './schemas/stats.schema';

import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Coupon, CouponSchema }  from '../coupons/schemas/coupon.schema';
import { Movie, MovieSchema }    from '../movies/schemas/movie.schema';

@Module({
  imports: [
    // Para que StatsService pueda inyectar estos modelos:
    MongooseModule.forFeature([
      { name: Stats.name,    schema: StatsSchema },
      { name: Product.name,  schema: ProductSchema },
      { name: Coupon.name,   schema: CouponSchema },
      { name: Movie.name,    schema: MovieSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
