import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

type USGSPoint = { dateTime: string; value: string };
type USGSTimeSeries = {
  sourceInfo?: {
    siteName?: string;
    geoLocation?: { geogLocation?: { latitude?: number; longitude?: number } };
  };
  variable?: { unit?: { unitCode?: string } };
  values?: Array<{ value?: USGSPoint[] }>;
};

type USGSResponse = {
  value?: {
    timeSeries?: USGSTimeSeries[];
  };
};

type RiverData = {
  site: string;
  location: string;
  observed: number | null;
  unit: string;
  time: string | null;
  floodStage: number | null;
  coords?: { lat: number; lon: number };
  history: Array<{ t: string; v: number }>;
  prediction: Array<{ t: string; v: number }>;
};

const FLOOD_STAGE_FT: Record<string, number> = {
  "03381700": 37,
  "03322420": 37,
  "03322000": 39,
};

// GET /api/river?site=03322420   (primary shape used by frontend)
// Also supports /api/river/:siteId for flexibility.
router.get("/", async (req, res) => {
  const site = (req.query.site as string) || (req.query.stationId as string) || "03322420";
  try {
    const payload = await fetchRiverData(site);
    res.json(payload);
  } catch (err) {
    console.error("River data error:", err);
    res.status(500).json({ message: "Failed to fetch river data" });
  }
});

router.get("/:siteId", async (req, res) => {
  const site = req.params.siteId;
  try {
    const payload = await fetchRiverData(site);
    res.json(payload);
  } catch (err) {
    console.error("River data error:", err);
    res.status(500).json({ message: "Failed to fetch river data" });
  }
});

async function fetchRiverData(site: string): Promise<RiverData> {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site}&parameterCd=00065&period=P10D`;

  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`USGS ${r.status}`);
  }

  const j = (await r.json()) as USGSResponse;

  const ts = j?.value?.timeSeries?.[0];
  const siteName = ts?.sourceInfo?.siteName ?? `USGS Site ${site}`;
  const unit = ts?.variable?.unit?.unitCode ?? "ft";
  const coords = ts?.sourceInfo?.geoLocation?.geogLocation;
  const raw = ts?.values?.[0]?.value ?? [];

  const history = raw
    .map((p) => ({ t: p.dateTime, v: parseFloat(p.value) }))
    .filter((p) => Number.isFinite(p.v));

  const latest = history.at(-1);
  const floodStage = FLOOD_STAGE_FT[site] ?? null;

  const payload: RiverData = {
    site,
    location: siteName,
    observed: latest?.v ?? null,
    unit,
    time: latest?.t ?? null,
    floodStage,
    coords:
      coords && typeof coords.latitude === "number" && typeof coords.longitude === "number"
        ? { lat: coords.latitude, lon: coords.longitude }
        : undefined,
    history,
    // No official forecast yet – keep shape for UI compatibility
    prediction: [],
  };

  return payload;
}

export default router;
