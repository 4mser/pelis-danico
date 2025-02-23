// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: [
      'https://danico-pelis.vercel.app', // Tu dominio en Vercel
      'http://localhost:3001' ,
      'http://localhost:3000' 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
  });
  
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor listo en: http://0.0.0.0:${port}`);
}
bootstrap();