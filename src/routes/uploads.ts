import { Router } from "express";

const router = Router();

// Placeholder for any upload endpoints the frontend might expect.
router.post("/", (_req, res) => {
  res.status(501).json({ error: "Uploads not implemented" });
});

export default router;
