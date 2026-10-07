import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
  } );
  app.setGlobalPrefix( 'api/v1' );
  app.use( cookieParser() );
  app.use( compression() );
  app.use( helmet() );
  app.enableCors( {
    origin: process.env.COR_ORIGIN,
    credentials: true,
  } );
  app.useGlobalPipes(
    new ValidationPipe( {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    } ),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
