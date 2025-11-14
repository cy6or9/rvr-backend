import { Router, Request, Response } from "express";

const router = Router();

/* ---------------------------------------------------
   Types
--------------------------------------------------- */

type AQIResponse = {
  hourly?: {
    time?: string[];
    us_aqi?: (number | null)[];
  };
};

export type AQIData = {
  aqi: number | null;
  aqiColor: string;
  category: string;
};

/* ---------------------------------------------------
   Helpers
--------------------------------------------------- */

function aqiToColorAndCategory(aqi: number | null): {
  color: string;
  category: string;
} {
  if (aqi == null || !Number.isFinite(aqi)) {
    return { color: "#4CAF50", category: "Unknown" };
  }
  if (aqi <= 50) return { color: "#4CAF50", category: "Good" };
  if (aqi <= 100) return { color: "#F4D06F", category: "Moderate" };
  if (aqi <= 150) return { color: "#F4A259", category: "USG" };
  if (aqi <= 200) return { color: "#D35D6E", category: "Unhealthy" };
  if (aqi <= 300) return { color: "#9D4EDD", category: "Very Unhealthy" };
  return { color: "#B0003A", category: "Hazardous" };
}

/* ---------------------------------------------------
   AQI handler
   Used by:
   - /api/aqi           (index.ts direct)
   - /api/weather/aqi   (router below)
--------------------------------------------------- */

export async function aqiHandler(
  req: Request,
  res: Response
): Promise<void> {
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

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`AQI HTTP ${r.status}`);

    const j = (await r.json()) as AQIResponse;
    const values = Array.isArray(j.hourly?.us_aqi) ? j.hourly!.us_aqi! : [];

    let aqi: number | null = null;
    for (let i = values.length - 1; i >= 0; i--) {
      const v = values[i];
      if (typeof v === "number" && Number.isFinite(v)) {
        aqi = v;
        break;
      }
    }

    const { color, category } = aqiToColorAndCategory(aqi);
    const payload: AQIData = {
      aqi,
      aqiColor: color,
      category,
    };

    res.status(200).json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("AQI fetch error:", err);

    const { color, category } = aqiToColorAndCategory(null);
    const payload: AQIData = {
      aqi: null,
      aqiColor: color,
      category,
    };

    // Still 200 so the UI shows "No data" instead of breaking
    res.status(200).json(payload);
  }
}

/* ---------------------------------------------------
   Router
   Mounted at /api/weather
--------------------------------------------------- */

router.get("/aqi", aqiHandler);

export default router;
