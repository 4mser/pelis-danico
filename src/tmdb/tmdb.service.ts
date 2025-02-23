import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
    console.log('API Key TMDB:', this.apiKey ? 'OK' : 'FALTA'); // 👈 Verifica la clave
  }

  async searchMovies(query: string) {
    const url = `${this.baseUrl}/search/movie`;
    console.log(`Solicitando a TMDB: ${url}`); // 👈 Debug de URL
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          params: {
            api_key: this.apiKey,
            query: query,
            language: 'es-ES'
          }
        })
      );
      
      return response.data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null
      }));
    } catch (error) {
      console.error('Error en TMDB:', error.response?.data || error.message);
      throw error;
    }
  }
}