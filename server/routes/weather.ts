import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const router = Router();

export type AQIData = {
  aqi: number | null;
  aqiColor: string;
  category: string;
};

type OpenMeteoAQIResponse = {
  hourly?: {
    time?: string[];
    us_aqi?: (number | null)[];
  };
};

function aqiToColorAndCategory(aqi: number | null): {
  color: string;
  category: string;
} {
  if (aqi == null || Number.isNaN(aqi)) {
    return { color: "#9CA3AF", category: "Unknown" };
  }

  if (aqi <= 50) return { color: "#00E400", category: "Good" };
  if (aqi <= 100) return { color: "#FFFF00", category: "Moderate" };
  if (aqi <= 150)
    return { color: "#FF7E00", category: "Unhealthy for Sensitive Groups" };
  if (aqi <= 200) return { color: "#FF0000", category: "Unhealthy" };
  if (aqi <= 300) return { color: "#8F3F97", category: "Very Unhealthy" };
  return { color: "#7E0023", category: "Hazardous" };
}

async function aqiHandler(req: Request, res: Response): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: "Missing or invalid lat/lon" });
      return;
    }

    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${lat}&longitude=${lon}` +
      `&hourly=us_aqi&past_days=1&timezone=America/Chicago`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error("AQI HTTP error:", response.status, await response.text());
      const fallback = aqiToColorAndCategory(null);
      res.status(200).json({
        aqi: null,
        aqiColor: fallback.color,
        category: fallback.category,
      });
      return;
    }

    const data = (await response.json()) as OpenMeteoAQIResponse;
    const hourly = data?.hourly;

    let latest: number | null = null;

    if (
      hourly &&
      Array.isArray(hourly.time) &&
      Array.isArray(hourly.us_aqi) &&
      hourly.us_aqi.length
    ) {
      for (let i = hourly.us_aqi.length - 1; i >= 0; i--) {
        const v = hourly.us_aqi[i];
        if (typeof v === "number") {
          latest = v;
          break;
        }
      }
    }

    const { color, category } = aqiToColorAndCategory(latest);

    const payload: AQIData = {
      aqi: latest,
      aqiColor: color,
      category,
    };

    res.status(200).json(payload);
  } catch (err) {
    console.error("AQI fetch error:", err);
    const fallback = aqiToColorAndCategory(null);
    res.status(200).json({
      aqi: null,
      aqiColor: fallback.color,
      category: fallback.category,
    });
  }
}

// Mounted at /api in index.ts → /api/aqi
router.get("/aqi", aqiHandler);

export default router;
