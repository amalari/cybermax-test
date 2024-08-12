/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { instance } from './libs/winston.logger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.GATEWAY_PORT || 3000;
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env["LOCATION_MICROSERVICE_HOST"] ?? "127.0.0.1",
      port: Number(process.env["LOCATION_MICROSERVICE_PORT"]) ?? 3001,
    },
  });
  const config = new DocumentBuilder()
    .setTitle('Achmad Cybermax Test')
    .setDescription('Cybermax Test API description')
    .setVersion('1.0')
    .addTag('locations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
