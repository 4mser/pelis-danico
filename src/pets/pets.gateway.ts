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
  
    afterInit() {
      console.log('🐇 PetsGateway listo');
    }
  
    /** Emite el documento completo de Pet a todos los clientes */
    broadcastPet(pet: Pet) {
      this.server.emit('pet_update', pet);
    }
  }
  