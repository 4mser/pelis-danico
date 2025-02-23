// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 Hacer ConfigModule global
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MoviesModule,
    TmdbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}