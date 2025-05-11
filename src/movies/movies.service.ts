import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

import { Movie, MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesService {
  private petId: string;

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.petId = this.configService.get<string>('PET_ID');
  }

  async addMovie(
    title: string,
    apiId: string,
    list: 'Barbara' | 'Nico' | 'Juntos',
    poster?: string,
  ) {
    const movie = await new this.movieModel({ title, apiId, list, poster }).save();

    if (this.petId) {
      this.eventEmitter.emit('pet.interaction', {
        petId: this.petId,
        type: 'addMovie' as const,
      });
    }

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

    if (this.petId && watched) {
      this.eventEmitter.emit('pet.interaction', {
        petId: this.petId,
        type: 'markWatched' as const,
      });
    }

    return updated;
  }

  async deleteMovie(id: string) {
    const deleted = await this.movieModel.findByIdAndDelete(id).exec();

    if (!deleted) throw new NotFoundException('Movie not found');

    if (this.petId) {
      this.eventEmitter.emit('pet.interaction', {
        petId: this.petId,
        type: 'deleteMovie' as const,
      });
    }

    return deleted;
  }
}
