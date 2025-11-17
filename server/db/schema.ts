import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles, {
  title: (schema) => schema.title.min(1, "Title is required"),
  excerpt: (schema) => schema.excerpt.min(1, "Excerpt is required"),
  content: (schema) => schema.content.min(1, "Content is required"),
  category: (schema) => schema.category.min(1, "Category is required"),
  author: (schema) => schema.author.min(1, "Author is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateArticleSchema = insertArticleSchema.partial();

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Article = typeof articles.$inferSelect;
