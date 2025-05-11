// src/pets/pets.controller.ts
import { Controller, Get, Post, Param } from '@nestjs/common';
import { PetsService, InteractionType } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  /** Inicializa (o devuelve) la mascota por defecto */
  @Post()
  createPet() {
    return this.petsService.getPet();
  }

  /** Obtiene el estado de Bunny */
  @Get()
  getPet() {
    return this.petsService.getPet();
  }

  /** Dispara una interacción sobre Bunny */
  @Post('interact/:type')
  interact(
    @Param('type') type: InteractionType,
  ) {
    return this.petsService.handleInteraction(type);
  }
}
