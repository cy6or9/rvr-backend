import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Simple helper to coerce query params
function getCoord(value: unknown): number | null {
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// GET /api/weather?lat=..&lon=..
router.get("/weather", async (req, res) => {
  const lat = getCoord(req.query.lat);
  const lon = getCoord(req.query.lon);

  if (lat == null || lon == null) {
    return res.status(400).json({ message: "lat and lon query parameters are required" });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code",
    );
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      console.error("Weather API error:", text);
      return res.status(502).json({ message: "Weather upstream error" });
    }

    const data = (await response.json()) as any;
    const current = data.current ?? {};

    const result = {
      tempF: current.temperature_2m ?? null,
      apparentTempF: current.apparent_temperature ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windDir: current.wind_direction_10m ?? null,
      weatherCode: current.weather_code ?? null,
      raw: current,
    };

    res.json(result);
  } catch (err) {
    console.error("Weather handler error:", err);
    res.status(500).json({ message: "Failed to fetch weather" });
  }
});

// GET /api/aqi?lat=..&lon=..
router.get("/aqi", async (req, res) => {
  const lat = getCoord(req.query.lat);
  const lon = getCoord(req.query.lon);

  if (lat == null || lon == null) {
    return res.status(400).json({ message: "lat and lon query parameters are required" });
  }

  try {
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("current", "european_aqi");

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      console.error("AQI API error:", text);
      return res.status(502).json({ message: "AQI upstream error" });
    }

    const data = (await response.json()) as any;
    const current = data.current ?? {};

    const result = {
      aqi: current.european_aqi ?? null,
      raw: current,
    };

    res.json(result);
  } catch (err) {
    console.error("AQI handler error:", err);
    res.status(500).json({ message: "Failed to fetch AQI" });
  }
});

export default router;
