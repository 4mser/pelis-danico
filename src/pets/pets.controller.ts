// src/pets/pets.controller.ts

import { Controller, Get, Post, Param } from '@nestjs/common';
import { PetsService, InteractionType } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  /** No regeneramos mensaje aquí */
  @Get()
  getPet() {
    return this.petsService.getPet();
  }

  /** Interacción real */
  @Post('interact/:type')
  interact(@Param('type') type: InteractionType) {
    return this.petsService.handleInteraction(type);
  }
}
