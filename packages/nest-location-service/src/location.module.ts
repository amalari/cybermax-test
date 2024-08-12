import { Logger, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";

import { LocationController } from "./location.controller";
import { LocationService } from "./location.service";
import { LOCATION_MICROSERVICE } from "./location.module-definition";
import { LocationProxyController } from "./location-proxy.controller";
dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: LOCATION_MICROSERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env["LOCATION_MICROSERVICE_HOST"] ?? "127.0.0.1",
          port: Number(process.env["LOCATION_MICROSERVICE_PORT"]) ?? 3001,
        },
      },
    ]),
  ],
  controllers: [LocationProxyController, LocationController],
  providers: [LocationService, Logger],
})
export class LocationModule {}
