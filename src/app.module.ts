// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponsModule } from './coupons/coupons.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 Hacer ConfigModule global
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MoviesModule,
    TmdbModule,
    ProductsModule,
    CouponsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}