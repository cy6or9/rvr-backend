import { Router } from "express";

const router = Router();

/**
 * Temporary stub for image uploads.
 * Returns a placeholder image URL so the editor works and doesn't crash.
 *
 * Later you can replace this with real storage (S3, GCS, etc.).
 */
router.post("/upload", async (req, res) => {
  res.status(200).json({
    imageUrl: "/placeholder.jpg",
  });
});

export default router;
