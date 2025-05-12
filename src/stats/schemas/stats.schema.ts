// src/stats/schemas/stats.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatsDocument = Stats & Document;

@Schema({ collection: 'stats' })
export class Stats {
  @Prop({ default: 0 }) totalProducts: number;
  @Prop({ default: 0 }) totalBought: number;
  @Prop({ default: 0 }) totalLiked: number;
  
  @Prop({ default: 0 }) totalCoupons: number;
  @Prop({ default: 0 }) totalRedeemedCoupons: number;

  @Prop({ default: 0 }) totalMovies: number;
  @Prop({ default: 0 }) totalWatched: number;

  @Prop({ default: Date.now }) updatedAt: Date;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
