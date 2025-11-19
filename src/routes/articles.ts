import { Router } from "express";
import { db } from "../db/drizzle.js";
import { articles } from "../db/schema.js";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(articles);
  res.json(rows);
});

export default router;
