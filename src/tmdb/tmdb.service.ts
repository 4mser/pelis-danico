// src/tmdb/tmdb.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

export interface TmdbResult {
  id: number;
  title: string;
  poster: string | null;
  type: 'movie' | 'series';
}

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
  }

  /** Busca películas **y** series */
  async searchAll(query: string): Promise<TmdbResult[]> {
    const movieObs = this.httpService.get(`${this.baseUrl}/search/movie`, {
      params: { api_key: this.apiKey, query, language: 'es-ES' }
    });
    const tvObs = this.httpService.get(`${this.baseUrl}/search/tv`, {
      params: { api_key: this.apiKey, query, language: 'es-ES' }
    });

    // Ejecuta ambas en paralelo
    const [movieRes, tvRes] = await Promise.all([
      lastValueFrom(movieObs),
      lastValueFrom(tvObs)
    ]);

    const movies: TmdbResult[] = movieRes.data.results.map(m => ({
      id: m.id,
      title: m.title,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      type: 'movie'
    }));

    const series: TmdbResult[] = tvRes.data.results.map(s => ({
      id: s.id,
      title: s.name,
      poster: s.poster_path
        ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
        : null,
      type: 'series'
    }));

    // Mezcla y devuelve
    return [...movies, ...series];
  }
}
