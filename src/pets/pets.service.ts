// src/pets/pets.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel }            from '@nestjs/mongoose';
import { Model }                  from 'mongoose';
import { SchedulerRegistry }      from '@nestjs/schedule';
import { differenceInHours }      from 'date-fns';
import { clamp }                  from 'lodash';
import { ConfigService }          from '@nestjs/config';

import OpenAI from 'openai';

import { Pet, PetDocument }       from './schemas/pet.schema';
import { PetsGateway }            from './pets.gateway';

export type InteractionType =
  | 'addMovie' | 'markWatched' | 'deleteMovie'
  | 'addProduct' | 'buyProduct'  | 'likeOne'
  | 'likeBoth'   | 'addCoupon'   | 'redeemCoupon';

@Injectable()
export class PetsService implements OnModuleInit {
  private openai: OpenAI;

  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    private schedulerRegistry: SchedulerRegistry,
    private petsGateway: PetsGateway,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  onModuleInit() {
    // Decay cada hora
    const interval = setInterval(() => this.decay().catch(console.error), 1000*60*60);
    this.schedulerRegistry.addInterval('petDecayJob', interval);
  }

  /** Crea o devuelve la mascota sin regenerar mensaje */
  private async findOrCreate(): Promise<PetDocument> {
    let pet = await this.petModel.findOne().exec();
    if (!pet) {
      pet = await this.petModel.create({
        name: 'Rabanito',
        lastInteractionAt: new Date(),
        lastInteractionType: null,
        lastMessage: '',
      });
      // Genera y guarda el mensaje inicial
      const msg = await this.generateMessage(pet);
      pet.lastMessage = msg;
      await pet.save();
      this.petsGateway.broadcastPet(pet);
    }
    return pet;
  }

  /** Deltas como antes */
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

  /** Llama a OpenAI para crear un mensaje bonito */
  private async generateMessage(pet: PetDocument): Promise<string> {
    const sys = `Eres Rabanito, un conejo virtual que describe sus emociones en español.`;
    const usr = `
Estos son tus datos actuales:
- Felicidad: ${pet.happiness}%
- Energía: ${pet.energy}%
- Curiosidad: ${pet.curiosity}%
- Última interacción: ${pet.lastInteractionType ?? 'ninguna'}

Haz un mensaje breve y amistoso en español.
    `.trim();

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user',   content: usr },
      ],
      temperature: 0.8,
      max_tokens: 60,
    });
    return res.choices[0]!.message!.content.trim();
  }

  /** Maneja interacciones reales */
  async handleInteraction(type: InteractionType): Promise<PetDocument> {
    const pet = await this.findOrCreate();
    const delta = this.getDeltas(type);

    pet.happiness          = clamp(pet.happiness  + delta.happiness,  0,100);
    pet.energy             = clamp(pet.energy     + delta.energy,     0,100);
    pet.curiosity          = clamp(pet.curiosity  + delta.curiosity,  0,100);
    pet.lastInteractionAt   = new Date();
    pet.lastInteractionType = type;

    await pet.save();

    // Genera **solo ahora** el mensaje y guarda
    const msg = await this.generateMessage(pet);
    pet.lastMessage = msg;
    await pet.save();

    this.petsGateway.broadcastPet(pet);
    return pet;
  }

  /** Devuelve el estado actual SIN regenerar mensaje */
  async getPet(): Promise<PetDocument> {
    return this.findOrCreate();
  }

  /** Decadencia cada hora */
  private async decay(): Promise<void> {
    const pet = await this.findOrCreate();
    const hours = differenceInHours(new Date(), pet.lastInteractionAt);

    if (hours >= 12) {
      pet.happiness -= 20; pet.energy -= 10; pet.curiosity -= 15;
    } else if (hours >= 6) {
      pet.happiness -= 10; pet.energy -= 5;  pet.curiosity -= 7;
    } else if (hours >= 3) {
      pet.happiness -= 5;  pet.energy -= 3;
    } else {
      return;
    }

    pet.happiness = clamp(pet.happiness,  0,100);
    pet.energy    = clamp(pet.energy,     0,100);
    pet.curiosity = clamp(pet.curiosity,  0,100);
    pet.lastInteractionAt = new Date();

    await pet.save();

    // Genera y guarda mensaje post-decaída
    const msg = await this.generateMessage(pet);
    pet.lastMessage = msg;
    await pet.save();

    this.petsGateway.broadcastPet(pet);
  }
}
