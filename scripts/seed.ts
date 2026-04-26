import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "void-log.db");

async function seed() {
  console.log("🌱 Seeding database...");

  const db = new Database(dbPath);
  
  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'draft' NOT NULL,
      published_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      parent_id TEXT,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'editor' NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS styles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      css_variables TEXT NOT NULL,
      custom_css TEXT,
      is_active INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string' NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Create default admin user
  const adminEmail = "admin@voidlog.com";
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("voidlog2026", 12);
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      nanoid(),
      adminEmail,
      "Admin",
      passwordHash,
      "admin",
      Date.now()
    );
    console.log("✅ Admin user created: admin@voidlog.com / voidlog2026");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Create default styles
  const defaultStyles = [
    {
      name: "Deep Space",
      cssVariables: JSON.stringify({
        "--bg-primary": "#0a0a0f",
        "--bg-secondary": "#12121a",
        "--bg-card": "#16161f",
        "--text-primary": "#ffffff",
        "--text-secondary": "#8888aa",
        "--accent": "#6366f1",
      }),
      isActive: 1,
    },
    {
      name: "Cyberpunk",
      cssVariables: JSON.stringify({
        "--bg-primary": "#0d0d0d",
        "--bg-secondary": "#1a1a2e",
        "--bg-card": "#16213e",
        "--text-primary": "#e94560",
        "--text-secondary": "#a2d2ff",
        "--accent": "#00fff5",
      }),
      isActive: 0,
    },
    {
      name: "Minimal Light",
      cssVariables: JSON.stringify({
        "--bg-primary": "#fafafa",
        "--bg-secondary": "#f0f0f0",
        "--bg-card": "#ffffff",
        "--text-primary": "#1a1a1a",
        "--text-secondary": "#666666",
        "--accent": "#3b82f6",
      }),
      isActive: 0,
    },
  ];

  for (const style of defaultStyles) {
    const existing = db.prepare("SELECT id FROM styles WHERE name = ?").get(style.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO styles (id, name, css_variables, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(nanoid(), style.name, style.cssVariables, style.isActive, Date.now(), Date.now());
      console.log(`✅ Style "${style.name}" created`);
    }
  }

  // Create default settings
  const defaultSettings = [
    { key: "site_name", value: "VOID LOG", type: "string" },
    { key: "site_description", value: "A personal blog in the void", type: "string" },
    { key: "posts_per_page", value: "10", type: "number" },
    { key: "comment_moderation", value: "true", type: "boolean" },
  ];

  for (const setting of defaultSettings) {
    const existing = db.prepare("SELECT id FROM settings WHERE key = ?").get(setting.key);
    if (!existing) {
      db.prepare(`
        INSERT INTO settings (id, key, value, type, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(nanoid(), setting.key, setting.value, setting.type, Date.now());
      console.log(`✅ Setting "${setting.key}" created`);
    }
  }

  // Create sample posts
  const samplePosts = [
    {
      title: "Welcome to VOID LOG",
      slug: "welcome-to-void-log",
      content: `# Welcome to VOID LOG

Welcome to my personal blog! This is a space where I share thoughts on technology, programming, and life.

## Getting Started

This blog is built with Next.js 15, featuring a beautiful dark theme and smooth animations.

\`\`\`javascript
const greet = () => {
  console.log("Hello, Void!");
};
\`\`\`

Feel free to explore and leave comments!`,
      excerpt: "Welcome to my personal blog in the void.",
      status: "published",
    },
    {
      title: "Building a Dark Theme System",
      slug: "building-dark-theme-system",
      content: `# Building a Dark Theme System

Dark themes are more than just inverting colors. They require careful consideration of contrast, readability, and visual hierarchy.

## Key Principles

1. **Contrast**: Ensure sufficient contrast between text and background
2. **Hierarchy**: Use subtle variations to create depth
3. **Accent**: Choose an accent color that stands out but doesn't strain the eyes

## CSS Variables

The best approach is using CSS custom properties:

\`\`\`css
:root {
  --bg-primary: #0a0a0f;
  --accent: #6366f1;
}
\`\`\``,
      excerpt: "Learn how to build a beautiful dark theme system for your web applications.",
      status: "published",
    },
    {
      title: "Next.js 15 New Features",
      slug: "nextjs-15-new-features",
      content: `# Next.js 15 New Features

Next.js 15 brings exciting new features that improve developer experience and performance.

## Highlights

- Improved caching strategies
- Enhanced React 19 support
- Better error messages

More details coming soon...`,
      excerpt: "Explore the new features in Next.js 15.",
      status: "draft",
    },
  ];

  for (const post of samplePosts) {
    const existing = db.prepare("SELECT id FROM posts WHERE slug = ?").get(post.slug);
    if (!existing) {
      db.prepare(`
        INSERT INTO posts (id, title, slug, content, excerpt, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nanoid(),
        post.title,
        post.slug,
        post.content,
        post.excerpt,
        post.status,
        post.status === "published" ? Date.now() : null,
        Date.now(),
        Date.now()
      );
      console.log(`✅ Post "${post.title}" created`);
    }
  }

  db.close();
  console.log("🎉 Database seeding complete!");
  console.log("\n📝 Admin credentials:");
  console.log("   Email: admin@voidlog.com");
  console.log("   Password: voidlog2026");
}

seed().catch(console.error);
