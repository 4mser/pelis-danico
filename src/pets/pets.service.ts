// src/pets/pets.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interval } from '@nestjs/schedule';
import { differenceInHours } from 'date-fns';
import { clamp } from 'lodash';
import { Pet, PetDocument } from './schemas/pet.schema';

export type InteractionType =
  | 'addMovie'
  | 'markWatched'
  | 'deleteMovie'
  | 'addProduct'
  | 'buyProduct'
  | 'likeOne'
  | 'likeBoth'
  | 'addCoupon'
  | 'redeemCoupon';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
  ) {}

  /** Busca la mascota; si no existe, la crea */
  private async findOrCreate(): Promise<PetDocument> {
    let pet = await this.petModel.findOne().exec();
    if (!pet) {
      pet = await this.petModel.create({
        name: 'Bunny',
        lastInteractionAt: new Date(),
      });
    }
    return pet;
  }

  /** Map de tipos de interacción a deltas */
  private getDeltas(type: InteractionType) {
    switch (type) {
      case 'addMovie':     return { happiness: 0,  energy: 0,  curiosity: +10 };
      case 'markWatched':  return { happiness: +15, energy: 0,  curiosity: 0   };
      case 'deleteMovie':  return { happiness: 0,  energy: 0,  curiosity: -5  };
      case 'addProduct':   return { happiness: 0,  energy: 0,  curiosity: +8  };
      case 'buyProduct':   return { happiness: +12, energy: 0,  curiosity: 0   };
      case 'likeOne':      return { happiness: 0,  energy: +5, curiosity: 0   };
      case 'likeBoth':     return { happiness: +20, energy: 0,  curiosity: 0   };
      case 'addCoupon':    return { happiness: 0,  energy: 0,  curiosity: +7  };
      case 'redeemCoupon': return { happiness: +18, energy: 0,  curiosity: 0   };
      default:             return { happiness: 0,  energy: 0,  curiosity: 0   };
    }
  }

  /** Aplica un tipo de interacción a la mascota por defecto */
  async handleInteraction(type: InteractionType) {
    const pet = await this.findOrCreate();
    const delta = this.getDeltas(type);

    pet.happiness  = clamp(pet.happiness  + delta.happiness,  0, 100);
    pet.energy     = clamp(pet.energy     + delta.energy,     0, 100);
    pet.curiosity  = clamp(pet.curiosity  + delta.curiosity,  0, 100);
    pet.lastInteractionAt = new Date();

    return pet.save();
  }

  /** Devuelve el estado actual (crea la mascota si no existe) */
  async getPet() {
    return this.findOrCreate();
  }

  /** Job de decadencia automática cada hora */
  @Interval(1000 * 60 * 60)
  private async decayJob() {
    const pet = await this.findOrCreate();
    const hours = differenceInHours(new Date(), pet.lastInteractionAt);

    if (hours >= 12) {
      pet.happiness -= 20;
      pet.energy    -= 10;
      pet.curiosity -= 15;
    } else if (hours >= 6) {
      pet.happiness -= 10;
      pet.energy    -= 5;
      pet.curiosity -= 7;
    } else if (hours >= 3) {
      pet.happiness -= 5;
      pet.energy    -= 3;
    } else {
      return;
    }

    pet.happiness = clamp(pet.happiness, 0, 100);
    pet.energy    = clamp(pet.energy,    0, 100);
    pet.curiosity = clamp(pet.curiosity, 0, 100);

    await pet.save();
  }
}
