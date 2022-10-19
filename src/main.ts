import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MG_PORT, MG_URI, PORT } from './config';
import { firebaseApp } from './database/db.firebase';
import { AppModule } from './module/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const port = parseInt(PORT) || 3333;
  const firebase = firebaseApp;
  await app.listen(port);
  console.log(`PORT: ${port}`);
  console.log(`MONGO_DB: ${MG_URI}`);
  console.log(`MONGO_PORT: ${MG_PORT}`);
}
bootstrap();
