import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MG_PORT, MG_URI, PORT } from './config';
import { firebaseApp } from './database/db.firebase';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const port = parseInt(PORT) || 3333;
  await app.listen(port);
  console.log(`PORT: ${port}`);
  console.log(`MONGO_DB: ${MG_URI}`);
  console.log(`MONGO_PORT: ${MG_PORT}`);
}
bootstrap();
