import { Router } from "express";

declare const fetch: any;

const router = Router();

/**
 * Shape returned to the frontend RiverConditions page.
 */
type RiverPoint = { t: string; v: number };

type RiverResponse = {
  site: string;
  location: string;
  observed: number | null;
  unit: string;
  time: string | null;
  floodStage: number | null;
  history: RiverPoint[];
  prediction?: RiverPoint[];
};

// Optional static flood stages (ft) for key gauges.
// If a site is missing it simply returns null and the UI
// will still show the live level.
const FLOOD_STAGES: Record<string, number> = {
  "03303280": 25, // Pittsburgh, PA  (example values – tweak as needed)
  "03294500": 18, // Wheeling, WV
  "03322000": 38, // Uniontown, KY
  "03322190": 36, // Henderson, KY
  "03322420": 40, // J.T. Myers L&D, KY
  "03381700": 33, // Shawneetown, IL
  "03384500": 40, // Golconda, IL
  "03399800": 43, // Smithland L&D, KY
  "03612500": 42, // Metropolis, IL
  "07022000": 40, // Cairo, IL
};

// USGS instant-values (gage height in feet).
// ParameterCd 00065 = gage height.
const USGS_BASE =
  "https://waterservices.usgs.gov/nwis/iv/?format=json&parameterCd=00065&siteStatus=all";

/**
 * GET /api/river-data?site=03322420
 *
 * Returns the latest observation plus ~3 days of history
 * for the requested USGS site.
 */
router.get("/", async (req, res) => {
  const site = String(req.query.site || "").trim();

  if (!site) {
    res.status(400).json({ error: "Missing ?site= gauge id" });
    return;
  }

  try {
    // History: last 3 days
    const now = new Date();
    const start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const startISO = start.toISOString();

    const url =
      USGS_BASE +
      `&sites=${encodeURIComponent(site)}` +
      `&startDT=${encodeURIComponent(startISO)}`;

    const r = await fetch(url);
    if (!r || !r.ok) {
      const status = r?.status ?? "unknown";
      throw new Error(`USGS HTTP ${status}`);
    }

    const json = await r.json();

    const ts = json?.value?.timeSeries?.[0];
    if (!ts) {
      res.status(404).json({ error: "No time series for site" });
      return;
    }

    const sourceInfo = ts.sourceInfo;
    const siteName: string =
      sourceInfo?.siteName ||
      sourceInfo?.siteCode?.[0]?.value ||
      `Gauge ${site}`;

    const values = ts.values?.[0]?.value || [];

    const history: RiverPoint[] = values
      .map((v: any) => ({
        t: v.dateTime as string,
        v: v.value != null ? Number(v.value) : null,
      }))
      .filter((p) => typeof p.v === "number") as RiverPoint[];

    let observed: number | null = null;
    let time: string | null = null;
    if (history.length > 0) {
      const latest = history[history.length - 1];
      observed = latest.v;
      time = latest.t;
    }

    const floodStage = FLOOD_STAGES[site] ?? null;

    const payload: RiverResponse = {
      site,
      location: siteName,
      observed,
      unit: "ft",
      time,
      floodStage,
      history,
      prediction: [], // not wired yet – UI just shows “No data” for forecast
    };

    res.json(payload);
  } catch (err) {
    console.error("River route error:", err);
    res.status(500).json({ error: "Failed to load river data" });
  }
});

export default router;
