import express from "express";
import cors from "cors";

import riverRoute from "./routes/river";
import articlesRoute from "./routes/articles";
import weatherRoute from "./routes/weather";
import uploadsRoute from "./routes/uploads";

const app = express();

app.use(
  cors({
    origin: "*", // you can tighten this later to only your Netlify domain
    credentials: false,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

// River data (USGS)
app.use("/api/river", riverRoute);

// Articles (list, detail, CRUD)
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

