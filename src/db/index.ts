import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "./connection-url";
import * as schema from "./schema";

type Database = ReturnType<typeof createDatabase>;

function createDatabase() {
  const client = postgres(getDatabaseUrl(), { max: 10 });
  return drizzle(client, { schema });
}

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as typeof globalThis & { __db?: Database };

export const db: Database = globalForDb.__db ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}
