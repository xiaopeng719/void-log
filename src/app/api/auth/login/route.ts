import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import jwt from "jsonwebtoken";

const dbPath = path.join(process.cwd(), "data", "void-log.db");
const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-change-me";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    try {
      const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email) as any;

      if (!user) {
        return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
      }

      // Create JWT manually
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json({ success: true });
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: false, // HTTP 环境
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    } finally {
      db.close();
    }
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
