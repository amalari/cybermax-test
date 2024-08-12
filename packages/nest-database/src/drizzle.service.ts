import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DATABASE_CLIENT } from "./database.module-definition";
import { schema, database } from "@cybermax-test-1/database";

@Injectable()
export class DrizzleService {
  public db: PostgresJsDatabase<typeof schema>;
  constructor(
    @Inject(DATABASE_CLIENT) private readonly dbClient: postgres.Sql,
  ) {
    this.db = database.createDb(this.dbClient);
  }
}
