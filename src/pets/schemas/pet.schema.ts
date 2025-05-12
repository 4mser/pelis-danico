// src/pets/schemas/pet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InteractionType } from '../pets.service';

export type PetDocument = Pet & Document;

@Schema({ timestamps: true })
export class Pet {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 50, min: 0, max: 100 })
  happiness: number;

  @Prop({ default: 80, min: 0, max: 100 })
  energy: number;

  @Prop({ default: 50, min: 0, max: 100 })
  curiosity: number;

  @Prop({ default: () => new Date() })
  lastInteractionAt: Date;

  @Prop({
    enum: [
      'addMovie','markWatched','deleteMovie',
      'addProduct','buyProduct','likeOne',
      'likeBoth','addCoupon','redeemCoupon',
    ],
    default: null,
  })
  lastInteractionType?: InteractionType;

  @Prop({ default: '' })
  lastMessage: string;

  /** Estadísticas globales al momento de la última actualización */
  @Prop({ type: Object, default: {} })
  stats: Partial<{
    totalProducts: number;
    totalBought: number;
    totalLiked: number;
    totalCoupons: number;
    totalRedeemedCoupons: number;
    totalMovies: number;
    totalWatched: number;
  }>;
}

export const PetSchema = SchemaFactory.createForClass(Pet);
