import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema>;

try {
  console.log("Initializing database connection");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined");
    throw new Error("DATABASE_URL is not defined");
  }
  console.log("DATABASE_URL is present");

  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
  console.log("Database connection established");

  (async () => {
    try {
      await sql`select 1`;
      console.log("Database connection test query succeeded");
    } catch (err) {
      console.error("Database connection test query failed", err);
    }
  })();
} catch (error) {
  console.error("Failed to initialize database connection", error);
  throw error;
}

export { db };
export * from "./schema";
