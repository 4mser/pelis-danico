// src/movies/movies.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<MovieDocument>) {}

  async addMovie(title: string, apiId: string, list: 'Dani' | 'Nico' | 'Juntos', poster?: string) {
    return new this.movieModel({ title, apiId, list, poster }).save();
  }

  async getMoviesByList(list: 'Dani' | 'Nico' | 'Juntos') {
    return this.movieModel.find({ list });
  }

  async markAsWatched(id: string, watched: boolean) {
    return this.movieModel.findByIdAndUpdate(id, { watched }, { new: true });
  }
}
