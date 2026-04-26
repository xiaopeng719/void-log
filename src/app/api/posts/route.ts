import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/posts - List all posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let allPosts: any[] = [];
    
    if (status) {
      allPosts = await db.select().from(posts).where(eq(posts.status, status as "draft" | "published" | "archived"));
    } else {
      allPosts = await db.select().from(posts);
    }

    const sortedPosts = allPosts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "获取文章列表失败" }, { status: 500 });
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "标题、slug 和内容为必填项" },
        { status: 400 }
      );
    }

    const newPost = {
      id: crypto.randomUUID(),
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(posts).values(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "创建文章失败" }, { status: 500 });
  }
}
