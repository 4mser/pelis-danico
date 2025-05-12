import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { Pet, PetSchema } from './schemas/pet.schema';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsEventListener } from './pets.event-listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }]),
    EventEmitterModule, 
  ],
  providers: [PetsService, PetsEventListener],
  controllers: [PetsController],
  exports: [PetsService],
})
export class PetsModule {}
