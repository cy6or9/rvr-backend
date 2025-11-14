import { Router } from "express";

declare const fetch: any;

const router = Router();

/**
 * Very small AQI proxy so the frontend can keep your AirNow key
 * on the server side instead of in the browser.
 *
 * GET /api/aqi?lat=37.9&lon=-87.6
 *
 * Response shape matches the AQIData type used in the client:
 *   { aqi: number | null, category: string }
 */
router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: "lat and lon query params are required" });
    return;
  }

  const apiKey = process.env.548E45A5-5DCC-475E-A72D-504280F01B89;

  if (!apiKey) {
    // Graceful fallback so the UI still works, just without AQI numbers.
    res.json({ aqi: null, category: "Unknown" });
    return;
  }

  try {
    const url =
      "https://www.airnowapi.org/aq/observation/latLong/current/?" +
      `format=application/json&latitude=${lat}&longitude=${lon}` +
      "&distance=25&API_KEY=" +
      encodeURIComponent(apiKey);

    const r = await fetch(url);
    if (!r || !r.ok) {
      const status = r?.status ?? "unknown";
      throw new Error(`AirNow HTTP ${status}`);
    }

    const json = await r.json();

    if (!Array.isArray(json) || json.length === 0) {
      res.json({ aqi: null, category: "Unknown" });
      return;
    }

    // Prefer the "PM2.5" record if present, otherwise first entry.
    const preferred =
      json.find((obs: any) => obs.ParameterName === "PM2.5") ?? json[0];

    const aqi =
      preferred.AQI != null && !isNaN(Number(preferred.AQI))
        ? Number(preferred.AQI)
        : null;
    const category =
      preferred.Category?.Name || (aqi == null ? "Unknown" : "Uncategorized");

    res.json({ aqi, category });
  } catch (err) {
    console.error("AQI route error:", err);
    res.status(500).json({ aqi: null, category: "Unknown" });
  }
});

export default router;
