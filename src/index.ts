import dotenv from "dotenv";
dotenv.config();
import "./load-env.js";
import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { sessionMiddleware } from "./middleware/session.js";
import createSessionMiddleware from "./middleware/session.js";


import articles from "./routes/articles.js";
import river, { riverDataHandler } from "./routes/river.js";
import weather, { aqiHandler } from "./routes/weather.js";
import auth from "./routes/auth.js";
import uploads from "./routes/uploads.js";

const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);
app.use(createSessionMiddleware(pool));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Existing API routes
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on port ${PORT}`);
});
