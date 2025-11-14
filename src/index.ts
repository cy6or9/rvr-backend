import "./load-env.js";
import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { sessionMiddleware } from "./middleware/session.js";

import articles from "./routes/articles.js";
import river from "./routes/river.js";
import weather from "./routes/weather.js";
import auth from "./routes/auth.js";
import uploads from "./routes/uploads.js";

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/api/articles", articles);

// River / gauge data
// Matches the frontend call in RiverConditions.tsx: `/api/river-data?site=...`
app.use("/api/river-data", river);
// Also keep the older prefix working just in case something else uses it.
app.use("/api/river", river);

// AQI proxy
// Matches the frontend call: `/api/aqi?lat=...&lon=...`
app.use("/api/aqi", weather);
// Optional legacy prefix if you later add other weather endpoints.
app.use("/api/weather", weather);

app.use("/api/auth", auth);
app.use("/api/uploads", uploads);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
