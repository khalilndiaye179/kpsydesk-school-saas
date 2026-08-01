import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Scoper les routes avec le préfixe d'API global
  app.setGlobalPrefix('api/v1');

  // Validation globale des DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Activer les CORS pour le frontend React
  app.enableCors();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 KPSyDesk School API running on http://localhost:${port}/api/v1`);
}
bootstrap();
