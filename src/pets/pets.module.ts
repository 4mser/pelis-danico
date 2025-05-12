// src/pets/pets.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { Pet, PetSchema } from './schemas/pet.schema';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsEventListener } from './pets.event-listener';
import { PetsGateway } from './pets.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }]),
    EventEmitterModule,
  ],
  providers: [
    PetsService,
    PetsEventListener,
    PetsGateway,       // ← aquí
  ],
  controllers: [PetsController],
  exports: [PetsService],
})
export class PetsModule {}
