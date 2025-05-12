import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Movie, MovieDocument } from './schemas/movie.schema';
import { InteractionType } from '../pets/pets.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addMovie(
    title: string,
    apiId: string,
    list: 'Barbara' | 'Nico' | 'Juntos',
    poster?: string,
  ) {
    const movie = await new this.movieModel({ title, apiId, list, poster }).save();
    this.eventEmitter.emit('pet.interaction', { type: 'addMovie' as InteractionType });
    return movie;
  }

  async getMoviesByList(list: 'Barbara' | 'Nico' | 'Juntos') {
    return this.movieModel.find({ list }).exec();
  }

  async markAsWatched(id: string, watched: boolean) {
    const updated = await this.movieModel
      .findByIdAndUpdate(id, { watched }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Movie not found');
    if (watched) {
      this.eventEmitter.emit('pet.interaction', { type: 'markWatched' as InteractionType });
    }
    return updated;
  }

  async deleteMovie(id: string) {
    const deleted = await this.movieModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Movie not found');
    this.eventEmitter.emit('pet.interaction', { type: 'deleteMovie' as InteractionType });
    return deleted;
  }
}
