import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "void-log.db");

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    try {
      const user = db
        .prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?")
        .get(id);
      if (!user) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
      }
      return NextResponse.json(user);
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "获取用户失败" }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user (including password)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "名称和邮箱为必填项" },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    try {
      // Check if user exists
      const existing = db
        .prepare("SELECT id, email FROM users WHERE id = ?")
        .get(id) as any;
      if (!existing) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
      }

      // Check if email is taken by another user
      const emailConflict = db
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(email, id);
      if (emailConflict) {
        return NextResponse.json(
          { error: "该邮箱已被其他用户使用" },
          { status: 409 }
        );
      }

      // If changing password
      if (password) {
        if (password.length < 6) {
          return NextResponse.json(
            { error: "密码长度至少为 6 位" },
            { status: 400 }
          );
        }
        const passwordHash = await bcrypt.hash(password, 10);
        db.prepare(
          "UPDATE users SET name = ?, email = ?, password_hash = ?, role = ?, created_at = created_at WHERE id = ?"
        ).run(name, email, passwordHash, role || "editor", id);
      } else {
        db.prepare(
          "UPDATE users SET name = ?, email = ?, role = ?, created_at = created_at WHERE id = ?"
        ).run(name, email, role || "editor", id);
      }

      const updated = db
        .prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?")
        .get(id);
      return NextResponse.json(updated);
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    try {
      const existing = db
        .prepare("SELECT id FROM users WHERE id = ?")
        .get(id);
      if (!existing) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
      }

      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      return NextResponse.json({ success: true });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
  }
}
