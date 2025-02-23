// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Ajusta al puerto de tu frontend
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type']
  });
  await app.listen(3000);
  console.log(`🚀 Servidor listo en: ${await app.getUrl()}`);
}
bootstrap();