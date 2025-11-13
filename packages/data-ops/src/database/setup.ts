// packages/data-ops/database/setup.ts

import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";
import * as authSchema from "@/drizzle/auth-schema";

const fullSchema = { ...schema, ...authSchema };

type DbSchema = typeof fullSchema;
type DbInstance = NeonHttpDatabase<DbSchema>;

let db: DbInstance | undefined;

export function initDatabase(connection: { host: string; username: string; password: string }): DbInstance {
  if (db) {
    return db;
  }
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`;
  db = drizzle(connectionString, { schema: fullSchema });
  return db;
}

export function getDb(): DbInstance {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

export type Database = DbInstance;
