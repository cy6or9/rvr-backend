import { Router } from "express";

const router = Router();

// You can plug real auth here later. For now just stubs.
router.post("/login", (_req, res) => {
  res.status(501).json({ error: "Login not implemented" });
});

router.post("/logout", (_req, res) => {
  res.status(501).json({ error: "Logout not implemented" });
});

export default router;
