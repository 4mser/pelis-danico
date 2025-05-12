// src/pets/pets.controller.ts
import { Controller, Get, Post, Param } from '@nestjs/common';
import { PetsService, InteractionType } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  /** Obtiene el estado actual de Rabanito */
  @Get()
  getPet() {
    return this.petsService.getPet();
  }

  /** Ejecuta una interacción y actualiza a Rabanito */
  @Post('interact/:type')
  interact(@Param('type') type: InteractionType) {
    return this.petsService.handleInteraction(type);
  }
}
