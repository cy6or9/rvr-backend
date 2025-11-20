import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import createSessionMiddleware from "./middleware/session.js";
import { pool } from "./db/drizzle.js";

import articlesRouter from "./routes/articles.js";
import riverRouter, { riverDataHandler } from "./routes/river.js";
import weatherRouter, { aqiHandler } from "./routes/weather.js";
import authRouter from "./routes/auth.js";
import uploadsRouter from "./routes/uploads.js";

const app = express();

// JSON body parsing
app.use(express.json());

// CORS (Netlify + local dev)
app.use(corsMiddleware);

// Sessions backed by Postgres
app.use(createSessionMiddleware(pool));

// Routers
app.use("/api/articles", articlesRouter);
app.use("/api/river", riverRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/auth", authRouter);
app.use("/api/uploads", uploadsRouter);

// Endpoints your frontend actually calls

// River level data
app.get("/api/river-data", riverDataHandler);

// Air quality index
app.get("/api/aqi", aqiHandler);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
