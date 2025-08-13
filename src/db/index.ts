import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var db: NeonHttpDatabase<typeof schema> | undefined;
}

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db: NeonHttpDatabase<typeof schema> = global.db ?? createClient();
if (!global.db) {
  global.db = db;
}

export * from "./schema";
