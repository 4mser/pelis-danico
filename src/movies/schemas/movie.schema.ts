import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  apiId: string;

  @Prop({ required: true, enum: ['Barbara', 'Nico', 'Juntos'] })
  list: string;

  @Prop({ default: false })
  watched: boolean;

  @Prop()
  poster?: string;

  @Prop()
  watchedAt?: Date;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);