// src/pets/pets.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { differenceInHours } from 'date-fns';
import { clamp } from 'lodash';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { Pet, PetDocument } from './schemas/pet.schema';
import { PetsGateway } from './pets.gateway';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { Movie, MovieDocument } from '../movies/schemas/movie.schema';
import { StatsService } from '../stats/stats.service';

export type InteractionType =
  | 'addMovie' | 'markWatched' | 'deleteMovie'
  | 'addProduct'| 'buyProduct'| 'likeOne'
  | 'likeBoth' | 'addCoupon' | 'redeemCoupon';

@Injectable()
export class PetsService implements OnModuleInit {
  private openai: OpenAI;

  constructor(
    @InjectModel(Pet.name)      private petModel: Model<PetDocument>,
    @InjectModel(Product.name)  private productModel: Model<ProductDocument>,
    @InjectModel(Coupon.name)   private couponModel: Model<CouponDocument>,
    @InjectModel(Movie.name)    private movieModel: Model<MovieDocument>,
    private petsGateway: PetsGateway,
    private configService: ConfigService,
    private statsService: StatsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  onModuleInit() {
    // Decay cada hora
    const interval = setInterval(() => this.decay().catch(console.error), 1000 * 60 * 60);
    SchedulerRegistry.prototype.addInterval?.call(this, 'petDecayJob', interval);
  }

  /** Busca o crea el documento de Pet inicial */
  private async findOrCreate(): Promise<PetDocument> {
    let pet = await this.petModel.findOne().exec();
    if (!pet) {
      pet = await this.petModel.create({
        name: 'Rabanito',
        lastInteractionAt: new Date(),
        lastInteractionType: null,
        lastMessage: '',
      });
    }
    // Siempre actualizamos sus stats al vuelo
    pet.stats = await this.statsService.getCurrent();
    await pet.save();
    this.petsGateway.broadcastPet(pet);
    return pet;
  }

  /** Deltas de estado según tipo de interacción */
  private getDeltas(type: InteractionType) {
    switch (type) {
      case 'addMovie':     return { happiness: 0,   energy: 0,    curiosity: +5 };
      case 'markWatched':  return { happiness: +5,  energy: 0,    curiosity: 0 };
      case 'deleteMovie':  return { happiness: 0,   energy: 0,    curiosity: -5 };
      case 'addProduct':   return { happiness: 0,   energy: 0,    curiosity: +8 };
      case 'buyProduct':   return { happiness: +5,  energy: -5,   curiosity: 0 };
      case 'likeOne':      return { happiness: 0,   energy: +5,   curiosity: 0 };
      case 'likeBoth':     return { happiness: +10, energy: 0,    curiosity: 0 };
      case 'addCoupon':    return { happiness: 0,   energy: 0,    curiosity: +7 };
      case 'redeemCoupon': return { happiness: +10, energy: -5,   curiosity: 0 };
      default:             return { happiness: 0,   energy: 0,    curiosity: 0 };
    }
  }

  /** Contexto puntual de la última interacción */
  private async fetchContext(type: InteractionType): Promise<string> {
    switch (type) {
      case 'likeBoth': {
        const p = await this.productModel.findOne({ likeBoth: true }).sort({ updatedAt: -1 }).exec();
        return p ? `que a ambos les gustara el producto "${p.name}"` : '';
      }
      case 'likeOne': {
        const p = await this.productModel.findOne({
          $or: [{ likeNico: true }, { likeBarbara: true }],
        }).sort({ updatedAt: -1 }).exec();
        if (!p) return '';
        const quien = p.likeNico && !p.likeBarbara
          ? 'Nico' : p.likeBarbara && !p.likeNico
          ? 'Barbara' : 'alguien';
        return `${quien} le dio like al producto "${p.name}"`;
      }
      case 'buyProduct': {
        const p = await this.productModel.findOne({ bought: true }).sort({ updatedAt: -1 }).exec();
        return p ? `que compraron el producto "${p.name}"` : '';
      }
      case 'addCoupon': {
        const c = await this.couponModel.findOne().sort({ createdAt: -1 }).exec();
        return c ? `que se añadió el cupón "${c.title}"` : '';
      }
      case 'redeemCoupon': {
        const c = await this.couponModel.findOne({ redeemed: true }).sort({ updatedAt: -1 }).exec();
        return c ? `que canjearon el cupón "${c.title}"` : '';
      }
      case 'addMovie': {
        const m = await this.movieModel.findOne().sort({ createdAt: -1 }).exec();
        return m ? `que agregaron la película "${m.title}"` : '';
      }
      case 'markWatched': {
        const m = await this.movieModel.findOne({ watched: true }).sort({ updatedAt: -1 }).exec();
        return m ? `que vieron la película "${m.title}"` : '';
      }
      default:
        return '';
    }
  }

  /** Contexto de estadísticas globales */
  private async fetchStatsContext(): Promise<string> {
    const s = await this.statsService.getCurrent();
    return `Se tienen ${s.totalProducts} productos (${s.totalBought} comprados, ${s.totalLiked} favoritos); ` +
           `${s.totalCoupons} cupones (${s.totalRedeemedCoupons} canjeados); ` +
           `${s.totalMovies} películas/series (${s.totalWatched} vistas)`;
  }

  /** Genera el mensaje bonito para Rabanito */
  private async generateMessage(pet: PetDocument): Promise<string> {
    const ctxInter = pet.lastInteractionType
      ? await this.fetchContext(pet.lastInteractionType)
      : '';
    const ctxStats = await this.fetchStatsContext();

    const sys = `Eres un narrador juguetón que habla como una mascota virtual; tus mensajes son muy cortos, en español, y suenan espontáneos.`;
    const usr = `
Felicidad: ${pet.happiness}%  
Energía: ${pet.energy}%  
Curiosidad: ${pet.curiosity}%  
${ctxInter ? `Interacción reciente: ${ctxInter}` : ''}
Estadísticas: ${ctxStats}
Por favor, solo una frase divertida que refleje todo.
    `.trim();

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user',   content: usr },
      ],
      temperature: 1.0,
      max_tokens: 30,
    });

    return res.choices[0]!.message!.content.trim();
  }

  /** Maneja la interacción real, actualiza estado + stats + mensaje */
  async handleInteraction(type: InteractionType): Promise<PetDocument> {
    const pet = await this.findOrCreate();
    const delta = this.getDeltas(type);

    pet.happiness         = clamp(pet.happiness + delta.happiness, 0, 100);
    pet.energy            = clamp(pet.energy    + delta.energy,    0, 100);
    pet.curiosity         = clamp(pet.curiosity + delta.curiosity, 0, 100);
    pet.lastInteractionAt = new Date();
    pet.lastInteractionType = type;

    // Guardamos primero cambios básicos
    await pet.save();

    // Refrescamos estadísticas en Pet.stats
    pet.stats = await this.statsService.getCurrent();
    await pet.save();

    // Generamos y guardamos nuevo mensaje
    const msg = await this.generateMessage(pet);
    pet.lastMessage = msg;
    await pet.save();

    this.petsGateway.broadcastPet(pet);
    return pet;
  }

  /** Obtiene el estado actual SIN regenerar mensaje, pero con stats */
  async getPet(): Promise<PetDocument> {
    return this.findOrCreate();
  }

  /** Decadencia automática según tiempo inactivo */
  private async decay(): Promise<void> {
    const pet = await this.findOrCreate();
    const hours = differenceInHours(new Date(), pet.lastInteractionAt);

    if      (hours >= 12) { pet.happiness -= 20; pet.energy -= 10; pet.curiosity -= 15; }
    else if (hours >= 6)  { pet.happiness -= 10; pet.energy -= 5;  pet.curiosity -= 7; }
    else if (hours >= 3)  { pet.happiness -= 5;  pet.energy -= 3;  /* curiosidad sin cambio */ }
    else return;

    pet.happiness = clamp(pet.happiness,  0, 100);
    pet.energy    = clamp(pet.energy,     0, 100);
    pet.curiosity = clamp(pet.curiosity,  0, 100);
    pet.lastInteractionAt = new Date();

    await pet.save();

    // Actualiza stats + mensaje tras el decay
    pet.stats = await this.statsService.getCurrent();
    await pet.save();

    const msg = await this.generateMessage(pet);
    pet.lastMessage = msg;
    await pet.save();

    this.petsGateway.broadcastPet(pet);
  }
}
