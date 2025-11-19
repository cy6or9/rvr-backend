import { Router } from "express";

const router = Router();

// Empty placeholder route so module exists
router.get("/", (req, res) => {
  res.json({ ok: true, message: "Auth route active" });
});

export default router;
