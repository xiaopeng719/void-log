import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/comments/[id] - Get single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (!comment) {
      return NextResponse.json({ error: "评论未找到" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// PUT /api/comments/[id] - Update comment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!["pending", "approved", "spam", "deleted"].includes(status)) {
      return NextResponse.json({ error: "状态无效" }, { status: 400 });
    }

    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (!existingComment) {
      return NextResponse.json({ error: "评论未找到" }, { status: 404 });
    }

    await db.update(comments).set({ status }).where(eq(comments.id, id));

    const updatedComment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "更新评论失败" }, { status: 500 });
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (!existingComment) {
      return NextResponse.json({ error: "评论未找到" }, { status: 404 });
    }

    await db.delete(comments).where(eq(comments.id, id));

    return NextResponse.json({ message: "评论删除成功" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "删除评论失败" }, { status: 500 });
  }
}
