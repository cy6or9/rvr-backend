import { Router } from "express";
import { db } from "../db/drizzle";
import { articles, insertArticleSchema } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Public: published articles only (Home, public listing)
router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));

    res.json(rows);
  } catch (err) {
    console.error("GET /api/articles error:", err);
    res.status(500).json({ error: "Failed to load articles" });
  }
});

// Admin: all articles (draft + published)
router.get("/all", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt));

    res.json(rows);
  } catch (err) {
    console.error("GET /api/articles/all error:", err);
    res.status(500).json({ error: "Failed to load admin articles" });
  }
});

// Get a single article by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!rows.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/articles/:id error:", err);
    res.status(500).json({ error: "Failed to load article" });
  }
});

// Create new article
router.post("/", async (req, res) => {
  try {
    const parsed = insertArticleSchema.parse(req.body);

    const [created] = await db
      .insert(articles)
      // Cast to any to avoid overly-strict Drizzle TS inference
      .values(parsed as any)
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error("POST /api/articles error:", err);
    res.status(400).json({ error: err.message ?? "Invalid article data" });
  }
});

// Update article
router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Partial update, but still validate fields if present
    const parsed = insertArticleSchema.partial().parse(req.body);

    const [updated] = await db
      .update(articles)
      // Cast to any to keep the type-checker happy; runtime is just a plain object.
      .set({ ...(parsed as any), updatedAt: new Date() } as any)
      .where(eq(articles.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/articles/:id error:", err);
    res.status(400).json({ error: err.message ?? "Invalid article data" });
  }
});

// Delete article
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ deletedId: id });
  } catch (err) {
    console.error("DELETE /api/articles/:id error:", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

export default router;

