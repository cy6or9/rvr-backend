import { Router } from "express";

const router = Router();

// Placeholder for uploads if needed later
router.get("/", (req, res) => {
  res.json({ ok: true, message: "Uploads route active" });
});

export default router;
