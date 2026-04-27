import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// Posts table
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(), // MDX content
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .default("draft")
    .notNull(),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Comments table
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // for nested replies
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["pending", "approved", "spam", "deleted"] })
    .default("pending")
    .notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Users table (for admin)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] })
    .default("editor")
    .notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Styles table (theme customization)
export const styles = sqliteTable("styles", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  cssVariables: text("css_variables").notNull(), // JSON string
  customCss: text("custom_css"),
  isActive: integer("is_active", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Settings table (site config)
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type", { enum: ["string", "number", "boolean", "json"] })
    .default("string")
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Types for TypeScript
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type User = typeof users.$inferSelect;
export type Style = typeof styles.$inferSelect;
export type Setting = typeof settings.$inferSelect;
