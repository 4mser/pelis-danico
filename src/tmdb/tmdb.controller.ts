import { Controller, Get, Query } from '@nestjs/common';
import { TmdbService } from './tmdb.service';

@Controller('tmdb') // Ruta base
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search') // Ruta completa: GET /tmdb/search?query=...
  async searchMovies(@Query('query') query: string) {
    console.log(`Búsqueda recibida: ${query}`);
    try {
      const results = await this.tmdbService.searchMovies(query);
      console.log(`Resultados encontrados: ${results.length}`);
      return results;
    } catch (error) {
      console.error(`Error en búsqueda: ${error.message}`);
      return [];
    }
  }
}