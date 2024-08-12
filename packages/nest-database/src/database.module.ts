import { Global, Module } from "@nestjs/common";
import postgres from "postgres";

import {
  ConfigurableDatabaseModule,
  DATABASE_CLIENT,
  DATABASE_OPTIONS,
} from "./database.module-definition";
import { DatabaseOptions } from "./database-options";
import { DrizzleService } from "./drizzle.service";

@Global()
@Module({
  exports: [DrizzleService],
  providers: [
    DrizzleService,
    {
      provide: DATABASE_CLIENT,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        return postgres(databaseOptions.url);
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
