import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { TmdbService } from "./tmdb.service";
import { TmdbController } from "./tmdb.controller"; // 👈 Añade esta línea

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TmdbController], // 👈 Añade el controlador aquí
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}