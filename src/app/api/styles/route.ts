import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { styles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/styles - List all styles
export async function GET() {
  try {
    const allStyles = await db.select().from(styles).orderBy(desc(styles.createdAt));
    return NextResponse.json(allStyles);
  } catch (error) {
    console.error("Error fetching styles:", error);
    return NextResponse.json({ error: "Failed to fetch styles" }, { status: 500 });
  }
}

// POST /api/styles - Create new style
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cssVariables, customCss } = body;

    if (!name || !cssVariables) {
      return NextResponse.json(
        { error: "Name and CSS variables are required" },
        { status: 400 }
      );
    }

    const newStyle = {
      id: crypto.randomUUID(),
      name,
      cssVariables,
      customCss: customCss || null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(styles).values(newStyle);

    return NextResponse.json(newStyle, { status: 201 });
  } catch (error) {
    console.error("Error creating style:", error);
    return NextResponse.json({ error: "Failed to create style" }, { status: 500 });
  }
}
