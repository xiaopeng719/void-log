import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const dbPath = path.join(process.cwd(), "data", "void-log.db");
const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-change-me";

function getCurrentUser() {
  // This is a helper for server-side auth check
  // In GET handler we read from DB directly, auth is handled by middleware
  return null;
}

// GET /api/users - List all users
export async function GET() {
  try {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    try {
      const allUsers = db
        .prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC")
        .all();
      return NextResponse.json(allUsers);
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "邮箱、名称和密码为必填项" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少为 6 位" },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    try {
      // Check if email already exists
      const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(email);
      if (existing) {
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const id = crypto.randomUUID();
      const now = Date.now();

      db.prepare(
        "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(id, email, name, passwordHash, role || "editor", now);

      return NextResponse.json(
        { id, email, name, role: role || "editor" },
        { status: 201 }
      );
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }
}
