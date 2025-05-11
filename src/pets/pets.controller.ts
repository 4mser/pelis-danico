import { Controller, Get, Param, Post } from '@nestjs/common';
import { PetsService, InteractionType } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  /** Initialize pet */
  @Post()
  createPet() {
    return this.petsService.createIfNotExists();
  }

  /** Get pet stats */
  @Get(':id')
  getPet(@Param('id') id: string) {
    return this.petsService.getPet(id);
  }

  /** Simulate an interaction */
  @Post(':id/interact/:type')
  interact(
    @Param('id') id: string,
    @Param('type') type: InteractionType,
  ) {
    return this.petsService.handleInteraction(id, type);
  }
}
