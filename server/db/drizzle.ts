import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

const { Pool } = pkg;

/**
 * Postgres connection via DATABASE_URL.
 *
 * Example:
 *   postgres://user:password@host:5432/dbname
 *
 * For Render / Neon, enable SSL. This config uses SSL by default.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : {
          rejectUnauthorized: false,
        },
});

export const db = drizzle(pool);
