// src/movies/movies.controller.ts
import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
async addMovie(@Body() body: { 
  title: string; 
  apiId: string; 
  list: 'Barbara' | 'Nico' | 'Juntos';
  poster?: string; // Nuevo campo
}) {
  return this.moviesService.addMovie(body.title, body.apiId, body.list, body.poster);
}

  @Get(':list')
  async getMovies(@Param('list') list: 'Barbara' | 'Nico' | 'Juntos') {
    return this.moviesService.getMoviesByList(list);
  }

  @Patch(':id/watched')
  async markAsWatched(@Param('id') id: string, @Body() body: { watched: boolean }) {
    return this.moviesService.markAsWatched(id, body.watched);
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: string) {
    return this.moviesService.deleteMovie(id);
  }
}
