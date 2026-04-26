import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { styles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/styles/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const style = await db.query.styles.findFirst({
      where: eq(styles.id, id),
    });

    if (!style) {
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    return NextResponse.json(style);
  } catch (error) {
    console.error("Error fetching style:", error);
    return NextResponse.json({ error: "Failed to fetch style" }, { status: 500 });
  }
}

// PUT /api/styles/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { cssVariables, customCss, isActive } = body;

    const existingStyle = await db.query.styles.findFirst({
      where: eq(styles.id, id),
    });

    if (!existingStyle) {
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    // If activating this style, deactivate all others first
    if (isActive) {
      await db.update(styles).set({ isActive: false });
    }

    const updateData: any = { updatedAt: new Date() };
    if (cssVariables !== undefined) updateData.cssVariables = cssVariables;
    if (customCss !== undefined) updateData.customCss = customCss;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(styles).set(updateData).where(eq(styles.id, id));

    const updatedStyle = await db.query.styles.findFirst({
      where: eq(styles.id, id),
    });

    return NextResponse.json(updatedStyle);
  } catch (error) {
    console.error("Error updating style:", error);
    return NextResponse.json({ error: "Failed to update style" }, { status: 500 });
  }
}

// DELETE /api/styles/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existingStyle = await db.query.styles.findFirst({
      where: eq(styles.id, id),
    });

    if (!existingStyle) {
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    // Don't allow deleting if it's the only style
    const allStyles = await db.select().from(styles);
    if (allStyles.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last style" },
        { status: 400 }
      );
    }

    await db.delete(styles).where(eq(styles.id, id));

    return NextResponse.json({ message: "Style deleted successfully" });
  } catch (error) {
    console.error("Error deleting style:", error);
    return NextResponse.json({ error: "Failed to delete style" }, { status: 500 });
  }
}
