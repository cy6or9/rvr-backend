import express from "express";
import cors from "cors";

import riverRoute from "./routes/river.js";
import articlesRoute from "./routes/articles.js";
import weatherRoute from "./routes/weather.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();

// Basic JSON parsing for POST/PUT bodies
app.use(express.json());

// CORS – you can later lock this down to only your Netlify domain
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/river", riverRoute);
app.use("/api/articles", articlesRoute);
// Weather + AQI live under /api/weather and /api/aqi
app.use("/api", weatherRoute);
// Uploads stub: /api/upload
app.use("/api", uploadsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
