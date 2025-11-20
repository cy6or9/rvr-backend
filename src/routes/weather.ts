import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/weather?lat=..&lon=..
 * Uses OpenWeather current weather API
 */
router.get("/", weatherHandler);

export async function weatherHandler(req: Request, res: Response) {
  const lat = String(req.query.lat || "").trim();
  const lon = String(req.query.lon || "").trim();

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("OPENWEATHER_API_KEY is not set");
    return res.status(500).json({ error: "Weather API not configured" });
  }

  try {
    const url = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("units", "imperial");
    url.searchParams.set("appid", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `OpenWeather error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const temp = data?.main?.temp ?? null;
    const windSpeed = data?.wind?.speed ?? null;
    const windDeg = data?.wind?.deg ?? null;
    const condition = data?.weather?.[0]?.description ?? "";
    const icon = data?.weather?.[0]?.icon ?? "";

    res.json({
      temp,
      windSpeed,
      windDeg,
      condition,
      icon,
      raw: data
    });
  } catch (err) {
    console.error("GET /api/weather error:", err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
}

/**
 * GET /api/aqi?lat=..&lon=..
 * Uses AirNow API
 */
export async function aqiHandler(req: Request, res: Response) {
  const lat = String(req.query.lat || "").trim();
  const lon = String(req.query.lon || "").trim();

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) {
    console.error("AIRNOW_API_KEY is not set");
    return res.status(500).json({ error: "AQI API not configured" });
  }

  try {
    const url = new URL(
      "https://www.airnowapi.org/aq/observation/latLong/current/"
    );
    url.searchParams.set("format", "application/json");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("distance", "25");
    url.searchParams.set("API_KEY", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `AirNow error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const first = data?.[0];
    const aqi = first?.AQI ?? null;
    const category = first?.Category?.Name ?? null;

    res.json({ aqi, category, raw: data });
  } catch (err) {
    console.error("GET /api/aqi error:", err);
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
}

export default router;
