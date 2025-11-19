import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "../db/drizzle.js";

const PgSession = connectPg(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "user_sessions"
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000,
    sameSite: "lax",
    secure: false
  }
});
