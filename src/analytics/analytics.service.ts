import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

import { Insight } from './interfaces/insight.interface';
import { Coupon, CouponDocument } from 'src/coupons/schemas/coupon.schema';
import { Movie, MovieDocument } from 'src/movies/schemas/movie.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';

@Injectable()
export class AnalyticsService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getFullContext(): Promise<string> {
    const [coupons, movies, products] = await Promise.all([
      this.couponModel.find().sort({ createdAt: -1 }).exec(),
      this.movieModel.find().sort({ createdAt: -1 }).exec(),
      this.productModel.find().sort({ createdAt: -1 }).exec(),
    ]);

    const activeCoupons = coupons.filter(c => !c.redeemed);
    const redeemedCoupons = coupons.filter(c => c.redeemed);
    const watchedMovies = movies.filter(m => m.watched);
    const pendingMovies = movies.filter(m => !m.watched);
    const likedProducts = products.filter(p => p.likeBoth);

    return `
      ## Contexto Actual ##
      Cupones activos: ${activeCoupons.length} (${activeCoupons.map(c => c.title).join(', ')})
      Cupones canjeados: ${redeemedCoupons.length} (${redeemedCoupons.map(c => c.title).join(', ')})
      Películas vistas: ${watchedMovies.length} (${watchedMovies.map(m => m.title).join(', ')})
      Películas pendientes: ${pendingMovies.length} (${pendingMovies.map(m => m.title).join(', ')})
      Productos favoritos: ${likedProducts.length} (${likedProducts.map(p => p.name).join(', ')})
    `;
  }

  async generateInsights(): Promise<Insight[]> {
    const context = await this.getFullContext();
    
    const prompt = `
      Analiza los siguientes datos y genera 3 insights clave en formato JSON:
      ${context}

      Ejemplo de respuesta:
      {
        "insights": [
          {
            "title": "Tendencia de cupones",
            "description": "Se observa que el 60% de los cupones son para cenas románticas",
            "type": "coupon",
            "severity": "medium"
          }
        ]
      }

      Busca patrones interesantes en:
      - Uso de cupones (tipos, frecuencia)
      - Hábitos de visualización de películas
      - Preferencias de productos
      - Relación entre diferentes actividades
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      return result.insights || [];
    } catch (e) {
      console.error('Error parsing insights:', e);
      return [];
    }
  }

  async getRecommendations(): Promise<string[]> {
    const context = await this.getFullContext();
    
    const prompt = `
      Basado en estos datos:
      ${context}

      Genera 3 recomendaciones específicas para los usuarios en formato de lista.
      Ejemplo:
      1. "Podrían probar la película XYZ, similar a ABC que ya vieron"
      2. "Un cupón para... porque han disfrutado de..."
      3. "El producto DEF podría gustarles porque..."
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    return response.choices[0].message.content.split('\n').filter(Boolean);
  }
}