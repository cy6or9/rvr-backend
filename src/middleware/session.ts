import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Pool } from "pg";

export default function createSessionMiddleware(pool: Pool) {
  const PgStore = connectPgSimple(session);

  const secret = process.env.SESSION_SECRET || "fallback-session-secret";

  return session({
    store: new PgStore({
      pool,
      tableName: "session"
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Render is behind HTTPS; you can switch to true + trust proxy later
      maxAge: 24 * 60 * 60 * 1000
    }
  });
}
