// src/tmdb/tmdb.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TmdbService, TmdbResult } from './tmdb.service';

@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search')
  async search(
    @Query('query') query: string
  ): Promise<TmdbResult[]> {
    if (!query) return [];
    return this.tmdbService.searchAll(query);
  }
}
