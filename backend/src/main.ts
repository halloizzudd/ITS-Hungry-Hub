import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Add /api prefix to all routes
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  // app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000'], // Front-end URLs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transforms payload to DTOs
      whitelist: true, // Strips properties that don't have decorators
    }),
  );
  await app.listen(4000);
}

void bootstrap();
