import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export const createDb = (dbClient: postgres.Sql) =>
  drizzle(dbClient, { schema });
