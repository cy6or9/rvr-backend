import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const site = req.query.site;
    if (!site) return res.json({ error: "Missing site" });

    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site}&parameterCd=00065`;
    const r = await fetch(url);
    const j = await r.json();

    let value = null;
    let time = null;

    try {
      value = j.value.timeSeries[0].values[0].value[0].value;
      time = j.value.timeSeries[0].values[0].value[0].dateTime;
    } catch (e) {}

    res.json({
      site,
      observed: value,
      time,
      unit: "ft"
    });

  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to load USGS data" });
  }
});

export default router;
