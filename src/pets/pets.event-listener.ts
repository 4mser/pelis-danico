// src/pets/pets.event-listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PetsService, InteractionType } from './pets.service';

@Injectable()
export class PetsEventListener {
  constructor(private petsService: PetsService) {}

  @OnEvent('pet.interaction')
  async onInteraction(payload: { type: InteractionType }) {
    await this.petsService.handleInteraction(payload.type);
  }
}
