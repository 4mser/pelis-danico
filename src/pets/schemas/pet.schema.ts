import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const PetSchema = SchemaFactory.createForClass(Pet);
