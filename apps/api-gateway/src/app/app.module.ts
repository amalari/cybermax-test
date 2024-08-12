import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { DatabaseModule } from '@cybermax-test-1/nest-database';
import { LocationModule } from '@cybermax-test-1/nest-location-service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('DATABASE_URL'),
      }),
    }),
    LocationModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
