import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.get("/:stationId", async (req, res) => {
  const { stationId } = req.params;

  try {
    const url =
      `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${stationId}&parameterCd=00065,00060&siteStatus=all`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.value?.timeSeries?.length) {
      return res.json({
        site: stationId,
        location: "Unknown",
        observed: null,
        unit: "",
        time: null,
        floodStage: null,
        history: [],
      });
    }

    const ts = data.value.timeSeries[0];
    const firstValue = ts.values[0]?.value?.[0];

    const observed = firstValue?.value
      ? Number(firstValue.value)
      : null;

    const time = firstValue?.dateTime ?? null;
    const unit = ts?.variable?.unit?.unitCode ?? "";

    res.json({
      site: stationId,
      location: ts.sourceInfo.siteName,
      observed,
      unit,
      time,
      floodStage: null,
      history: [],
    });
  } catch (err) {
    console.error("USGS error:", err);

    res.json({
      site: stationId,
      location: "Unknown",
      observed: null,
      unit: "",
      time: null,
      floodStage: null,
      history: [],
    });
  }
});

export default router;
