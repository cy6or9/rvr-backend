import express from "express";
import cors from "cors";

import riverRoute from "./routes/river.js";
import articlesRoute from "./routes/articles.js";
import weatherRoute from "./routes/weather.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();

app.use(
  cors({
    origin: "*", // you can tighten this later to only your Netlify domain
    credentials: false,
  })
);

// JSON body parsing
app.use(express.json());

// Healthcheck
app.get("/", (_req, res) => {
  res.send("RVR backend running");
});

// River conditions: /api/river/:stationId
app.use("/api/river", riverRoute);

// Articles: /api/articles
app.use("/api/articles", articlesRoute);

// AQI: /api/aqi?lat=...&lon=...
app.use("/api", weatherRoute);

// Uploads stub: /api/upload
app.use("/api", uploadsRoute);

// PORT (Render/anything else uses process.env.PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
