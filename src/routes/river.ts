import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/river-data?site=XXXXXXXX
 *
 * Returns:
 * {
 *   site: string;
 *   location: string;
 *   observed: number | null;
 *   unit: string;
 *   time: string | null;
 *   floodStage: number | null;
 *   history: Array<{ time: string; value: number }>;
 *   prediction: Array<{ time: string; value: number }>;
 * }
 */

export async function riverDataHandler(req: Request, res: Response) {
  const site = String(req.query.site || "").trim();

  if (!site) {
    return res.status(400).json({ error: "Missing ?site= parameter" });
  }

  try {
    const url = new URL(
      "https://waterservices.usgs.gov/nwis/iv/"
    );
    url.searchParams.set("sites", site);
    url.searchParams.set("parameterCd", "00065"); // Gage height
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `USGS request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const ts =
      data?.value?.timeSeries?.[0]?.values?.[0]?.value || [];

    const latest = ts[ts.length - 1];

    const observed =
      latest && latest.value ? Number(latest.value) : null;
    const time =
      latest && latest.dateTime ? String(latest.dateTime) : null;

    const history = ts.slice(-24).map((p: any) => ({
      time: String(p.dateTime),
      value: Number(p.value)
    }));

    // Optional hard-coded flood stage mapping (adjust as needed)
    const floodStageMap: Record<string, number> = {
      // Example: "03294610": 40
    };

    const floodStage =
      site in floodStageMap ? floodStageMap[site] : null;

    res.json({
      site,
      location: `USGS Site ${site}`,
      observed,
      unit: "ft",
      time,
      floodStage,
      history,
      prediction: [] // you can later plug in NWS forecast here
    });
  } catch (err) {
    console.error("GET /api/river-data error:", err);
    res.json({
      site,
      location: `USGS Site ${site}`,
      observed: null,
      unit: "ft",
      time: null,
      floodStage: null,
      history: [],
      prediction: []
    });
  }
}

// Simple router stub (if you want further river endpoints later)
router.get("/", (_req, res) => {
  res.json({ ok: true });
});

export default router;
