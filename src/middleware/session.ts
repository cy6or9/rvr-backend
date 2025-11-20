import session from "express-session";
import PgSession from "connect-pg-simple";

export default function createSessionMiddleware(pool) {
  const PGStore = PgSession(session);

  const secret = process.env.SESSION_SECRET || "fallback-secret";

  return session({
    store: new PGStore({
      pool,
      tableName: "session"
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  });
}

