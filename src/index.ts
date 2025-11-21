import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db/drizzle.js";

import riverRoutes from "./routes/river.js";
import weatherRoutes from "./routes/weather.js";
import articleRoutes from "./routes/articles.js";

const app = express();

// ------------ Middleware ---------------
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ------------ Sessions -----------------
const PgSessionStore = pgSession(session);

app.use(
  session({
    store: new PgSessionStore({
      pool: pool,
      tableName: "session"
    }),
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// ------------ Routes -------------------
app.use("/api/river-data", riverRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/articles", articleRoutes);

// ------------ Start Server -------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
