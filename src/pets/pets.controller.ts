import { Controller, Get, Post, Param } from '@nestjs/common';
import { PetsService, InteractionType } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  /** Inicializa (o devuelve) a Bunny */
  @Post()
  createPet() {
    return this.petsService.getPet();
  }

  /** Obtiene stats de Bunny */
  @Get()
  getPet() {
    return this.petsService.getPet();
  }

  /** Dispara interacción */
  @Post('interact/:type')
  interact(@Param('type') type: InteractionType) {
    return this.petsService.handleInteraction(type);
  }
}
