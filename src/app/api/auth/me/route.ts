import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-change-me";

// GET /api/auth/me - Get current logged-in user from session cookie
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    return NextResponse.json({
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });
  } catch {
    return NextResponse.json({ error: "无效会话" }, { status: 401 });
  }
}
