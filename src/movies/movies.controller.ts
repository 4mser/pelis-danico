// src/movies/movies.controller.ts
import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
async addMovie(@Body() body: { 
  title: string; 
  apiId: string; 
  list: 'Dani' | 'Nico' | 'Juntos';
  poster?: string; // Nuevo campo
}) {
  return this.moviesService.addMovie(body.title, body.apiId, body.list, body.poster);
}

  @Get(':list')
  async getMovies(@Param('list') list: 'Dani' | 'Nico' | 'Juntos') {
    return this.moviesService.getMoviesByList(list);
  }

  @Patch(':id/watched')
  async markAsWatched(@Param('id') id: string, @Body() body: { watched: boolean }) {
    return this.moviesService.markAsWatched(id, body.watched);
  }
}
