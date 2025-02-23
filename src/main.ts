// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001, https://danico-pelis.vercel.app/', // Ajusta al puerto de tu frontend
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type']
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor listo en: ${await app.getUrl()}`);
}
bootstrap();