import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { client } from './cache/redis.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await client.connect(); //connects to localhost:6379
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
