import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const key = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) return res.json({ error: "Missing lat/lon" });

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
    const r = await fetch(url);
    const j = await r.json();

    res.json(j);
  } catch (e) {
    res.json({ error: "Weather error" });
  }
});

export default router;
