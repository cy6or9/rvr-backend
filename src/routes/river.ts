import { Router, Request, Response } from "express";

const router = Router();

/* ---------------------------------------------------
   Types
--------------------------------------------------- */
type USGSPoint = { dateTime: string; value: string };

type USGSResponse = {
  value?: {
    timeSeries?: Array<{
      sourceInfo?: {
        siteName?: string;
        geoLocation?: {
          geogLocation?: {
            latitude?: number;
            longitude?: number;
          };
        };
      };
      variable?: {
        unit?: { unitCode?: string };
      };
      values?: Array<{ value?: USGSPoint[] }>;
    }>;
  };
};

export type RiverData = {
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

/**
 * Manual flood-stage reference for the main gauges we care about.
 * Add more as needed (key is the USGS site id).
 */
const FLOOD_STAGE_FT: Record<string, number> = {
  "03381700": 37, // Newburgh
  "03322420": 37, // J.T. Myers
  "03322000": 39, // Smithland
};

/* ---------------------------------------------------
   Helpers
--------------------------------------------------- */

function generatePrediction(history: Array<{ t: string; v: number }>): Array<{
  t: string;
  v: number;
}> {
  if (!history.length) return [];

  const lastTen = history.slice(-10);
  const slope =
    lastTen.length > 1
      ? (lastTen[lastTen.length - 1].v - lastTen[0].v) /
        (lastTen.length - 1)
      : 0;

  const lastValue = lastTen[lastTen.length - 1].v;
  const now = new Date(lastTen[lastTen.length - 1].t).getTime();

  // Very simple linear projection for the next 10 days
  return Array.from({ length: 10 }, (_, i) => ({
    t: new Date(now + (i + 1) * 86400000).toISOString(),
    v: parseFloat((lastValue + slope * (i + 1)).toFixed(2)),
  }));
}

/* ---------------------------------------------------
   Handler used by both:
   - /api/river-data        (index.ts direct)
   - /api/river/data        (router below)
--------------------------------------------------- */

export async function riverDataHandler(
  req: Request,
  res: Response
): Promise<void> {
  const site = (req.query.site as string) || "03322420";

  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site}&parameterCd=00065&period=P10D`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      throw new Error(`USGS HTTP ${r.status}`);
    }

    const j = (await r.json()) as USGSResponse;

    const ts = j?.value?.timeSeries?.[0];
    const siteName = ts?.sourceInfo?.siteName ?? `USGS Site ${site}`;

    const unit = ts?.variable?.unit?.unitCode ?? "ft";
    const coords = ts?.sourceInfo?.geoLocation?.geogLocation;

    const raw = (ts?.values?.[0]?.value ?? []) as USGSPoint[];

    const history = raw
      .map((p) => ({
        t: p.dateTime,
        v: parseFloat(p.value),
      }))
      .filter((p) => Number.isFinite(p.v));

    const latest = history.at(-1) ?? null;
    const floodStage = FLOOD_STAGE_FT[site] ?? null;

    const payload: RiverData = {
      site,
      location: siteName,
      observed: latest?.v ?? null,
      unit,
      time: latest?.t ?? null,
      floodStage,
      coords:
        typeof coords?.latitude === "number" &&
        typeof coords?.longitude === "number"
          ? { lat: coords.latitude, lon: coords.longitude }
          : undefined,
      history,
      prediction: generatePrediction(history),
    };

    res.status(200).json(payload);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("USGS fetch error:", err?.message ?? err);

    const fallback: RiverData = {
      site,
      location: `USGS Site ${site}`,
      observed: null,
      unit: "ft",
      time: null,
      floodStage: FLOOD_STAGE_FT[site] ?? null,
      history: [],
      prediction: [],
    };

    // Still return 200 so the frontend can show "No data" instead of hanging
    res.status(200).json(fallback);
  }
}

/* ---------------------------------------------------
   Router
   (Mounted at /api/river in index.ts)
   So /api/river/data works as well.
--------------------------------------------------- */

router.get("/data", riverDataHandler);

export default router;
