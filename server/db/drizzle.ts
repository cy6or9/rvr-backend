import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

const { Pool } = pkg;

/**
 * Postgres connection via DATABASE_URL.
 *
 * Example:
 *   postgres://user:password@host:5432/dbname
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool);
