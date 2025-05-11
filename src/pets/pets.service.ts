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

  /** Create the bunny if none exists */
  async createIfNotExists(name = 'Bunny'): Promise<PetDocument> {
    const existing = await this.petModel.findOne().exec();
    if (existing) return existing;
    return this.petModel.create({ name, lastInteractionAt: new Date() });
  }

  /** Map interaction type to stat deltas */
  private getDeltas(type: InteractionType) {
    switch (type) {
      case 'addMovie':     return { happiness: 0, energy: 0, curiosity: +10 };
      case 'markWatched':  return { happiness: +15, energy: 0, curiosity: 0 };
      case 'deleteMovie':  return { happiness: 0, energy: 0, curiosity: -5 };
      case 'addProduct':   return { happiness: 0, energy: 0, curiosity: +8 };
      case 'buyProduct':   return { happiness: +12, energy: 0, curiosity: 0 };
      case 'likeOne':      return { happiness: 0, energy: +5, curiosity: 0 };
      case 'likeBoth':     return { happiness: +20, energy: 0, curiosity: 0 };
      case 'addCoupon':    return { happiness: 0, energy: 0, curiosity: +7 };
      case 'redeemCoupon': return { happiness: +18, energy: 0, curiosity: 0 };
      default:             return { happiness: 0, energy: 0, curiosity: 0 };
    }
  }

  /** Clamp between 0 and 100 */
  private clampStat(value: number) {
    return clamp(value, 0, 100);
  }

  /** Handle any emitted interaction */
  async handleInteraction(petId: string, type: InteractionType) {
    const pet = await this.petModel.findById(petId);
    if (!pet) throw new NotFoundException('Pet not found');

    const delta = this.getDeltas(type);
    pet.happiness  = this.clampStat(pet.happiness  + delta.happiness);
    pet.energy     = this.clampStat(pet.energy     + delta.energy);
    pet.curiosity  = this.clampStat(pet.curiosity  + delta.curiosity);

    pet.lastInteractionAt = new Date();
    return pet.save();
  }

  /** Return current pet state */
  async getPet(petId: string) {
    const pet = await this.petModel.findById(petId);
    if (!pet) throw new NotFoundException('Pet not found');
    return pet;
  }

  /** Hourly decay job based on inactivity */
  @Interval(1000 * 60 * 60)
  private async decayJob() {
    const pet = await this.petModel.findOne().exec();
    if (!pet) return;

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

    pet.happiness = this.clampStat(pet.happiness);
    pet.energy    = this.clampStat(pet.energy);
    pet.curiosity = this.clampStat(pet.curiosity);
    await pet.save();
  }
}
