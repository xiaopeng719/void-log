import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/comments - List all comments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const status = searchParams.get("status");

  try {
    let allComments: any[] = [];

    if (postId) {
      allComments = await db.select().from(comments).where(eq(comments.postId, postId));
    } else if (status) {
      allComments = await db.select().from(comments).where(eq(comments.status, status as "pending" | "approved" | "spam" | "deleted"));
    } else {
      allComments = await db.select().from(comments).orderBy(desc(comments.createdAt));
    }
    
    // Get post titles for each comment
    const commentsWithPosts = await Promise.all(
      allComments.map(async (comment) => {
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, comment.postId),
          columns: { title: true, slug: true },
        });
        return { ...comment, postTitle: post?.title || "未知文章" };
      })
    );

    return NextResponse.json(commentsWithPosts);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "获取评论列表失败" }, { status: 500 });
  }
}

// POST /api/comments - Create new comment (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, parentId, authorName, authorEmail, content } = body;

    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "文章未找到" }, { status: 404 });
    }

    // Get IP and User Agent from request headers
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const newComment = {
      id: crypto.randomUUID(),
      postId,
      parentId: parentId || null,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim().toLowerCase(),
      content: content.trim(),
      status: "pending" as const, // All comments need moderation by default
      ip,
      userAgent,
      createdAt: new Date(),
    };

    await db.insert(comments).values(newComment);

    return NextResponse.json({ 
      ...newComment, 
      message: "评论已提交，等待审核" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "创建评论失败" }, { status: 500 });
  }
}
