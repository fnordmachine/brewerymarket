import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim());
  app.enableCors({ origin: configuredOrigins?.length ? configuredOrigins : true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`MarketBreja API disponível em http://localhost:${port}`);
}

void bootstrap();
