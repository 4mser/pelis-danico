// src/pets/pets.gateway.ts

import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  import { Pet } from './schemas/pet.schema';
  
  @WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/pets',
  })
  export class PetsGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
  
    afterInit(server: Server) {
      console.log('🐇 PetsGateway initialized');
    }
  
    /** Ahora acepta pet + mensaje */
    broadcastPet(pet: Pet, message?: string) {
      this.server.emit('pet_update', { pet, message });
    }
  }
  