// src/movies/schemas/movie.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema()
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  apiId: string; // ID de la película en la API externa

  @Prop({ required: true })
  list: 'Barbara' | 'Nico' | 'Juntos';

  @Prop({ default: false })
  watched: boolean;

  @Prop() // Nuevo campo añadido
  poster?: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
