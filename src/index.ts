// src/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import createSessionMiddleware from "./middleware/session.js";
import { pool } from "./db/drizzle.js";

import articles from "./routes/articles.js";
import river, { riverDataHandler } from "./routes/river.js";
import weather, { aqiHandler } from "./routes/weather.js";
import auth from "./routes/auth.js";
import uploads from "./routes/uploads.js";

const app = express();

// Parse JSON bodies
app.use(express.json());

// CORS for rivervalleyreport.com
app.use(corsMiddleware);

// Sessions using Postgres store; never crashes (fallback secret if missing)
app.use(createSessionMiddleware(pool));

// Mount routers
app.use("/api/articles", articles);
app.use("/api/river", river);
app.use("/api/weather", weather);
app.use("/api/auth", auth);
app.use("/api/uploads", uploads);

// --- Endpoints your frontend actually calls ---

// River conditions: /api/river-data?site=03322420
app.get("/api/river-data", riverDataHandler);

// AQI: /api/aqi?lat=...&lon=...
app.get("/api/aqi", aqiHandler);

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
