// src/pets/pets.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsEventListener } from './pets.event-listener';
import { PetsGateway } from './pets.gateway';

import { Pet, PetSchema } from './schemas/pet.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { Movie, MovieSchema } from '../movies/schemas/movie.schema';

@Module({
  imports: [
    // Registramos todos los modelos para poder inyectar
    MongooseModule.forFeature([
      { name: Pet.name, schema: PetSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Movie.name, schema: MovieSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    PetsService,
    PetsEventListener,
    PetsGateway,
  ],
  controllers: [PetsController],
  exports: [PetsService],
})
export class PetsModule {}
