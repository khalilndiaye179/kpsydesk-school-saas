import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // En-têtes HTTP de sécurité (Helmet)
  app.use(helmet());

  // Scoper les routes avec le préfixe d'API global
  app.setGlobalPrefix('api/v1');

  // Validation globale des DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Restreindre les CORS aux domaines et sous-domaines SaaS autorisés
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:80'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /\.kpsyschool\.com$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy Error: Origin ${origin} not allowed.`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,x-tenant-id',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 KPSyDesk School API running on http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
