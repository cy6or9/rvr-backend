import { Router } from "express";
import { db } from "../db/drizzle.js";
import { articles, insertArticleSchema, updateArticleSchema } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { fromError } from "zod-validation-error";

const router = Router();

// GET /api/articles        -> published only (public)
router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("Error fetching published articles:", err);
    res.status(500).json({ message: "Failed to load articles" });
  }
});

// GET /api/articles/all    -> all statuses (admin)
router.get("/all", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all articles:", err);
    res.status(500).json({ message: "Failed to load articles" });
  }
});

// GET /api/articles/:id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [row] = await db.select().from(articles).where(eq(articles.id, id));
    if (!row) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(row);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ message: "Failed to load article" });
  }
});

// POST /api/articles       -> create
router.post("/", async (req, res) => {
  try {
    const parse = insertArticleSchema.safeParse(req.body);
    if (!parse.success) {
      const msg = fromError(parse.error).toString();
      return res.status(400).json({ message: msg });
    }

    const [inserted] = await db
      .insert(articles)
      .values({
        ...parse.data,
        status: parse.data.status ?? "draft",
      })
      .returning();

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ message: "Failed to create article" });
  }
});

// PUT /api/articles/:id    -> update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const parse = updateArticleSchema.safeParse(req.body);
    if (!parse.success) {
      const msg = fromError(parse.error).toString();
      return res.status(400).json({ message: msg });
    }

    const [updated] = await db
      .update(articles)
      .set({
        ...parse.data,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ message: "Failed to update article" });
  }
});

// DELETE /api/articles/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [deleted] = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning();
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ message: "Failed to delete article" });
  }
});

export default router;
