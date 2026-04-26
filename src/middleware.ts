import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

const protectedPaths = [
  "/dashboard",
  "/posts/new",
  "/posts/edit",
  "/comments",
  "/settings",
  "/styles",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const headers = new Headers(request.headers);
    headers.set("x-user-id", (payload as any).id || "");
    headers.set("x-user-email", (payload as any).email || "");
    headers.set("x-user-name", (payload as any).name || "");
    headers.set("x-user-role", (payload as any).role || "");

    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/posts/new/:path*",
    "/posts/edit/:path*",
    "/comments/:path*",
    "/settings/:path*",
    "/styles/:path*",
  ],
};
