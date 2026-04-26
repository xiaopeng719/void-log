import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, any> = {};
    
    allSettings.forEach((setting) => {
      if (setting.type === "number") {
        settingsMap[setting.key] = parseInt(setting.value);
      } else if (setting.type === "boolean") {
        settingsMap[setting.key] = setting.value === "true";
      } else if (setting.type === "json") {
        try {
          settingsMap[setting.key] = JSON.parse(setting.value);
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      } else {
        settingsMap[setting.key] = setting.value;
      }
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      
      const existing = await db.query.settings.findFirst({
        where: eq(settings.key, key),
      });

      if (existing) {
        await db
          .update(settings)
          .set({ value: stringValue, updatedAt: new Date() })
          .where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({
          id: crypto.randomUUID(),
          key,
          value: stringValue,
          type: typeof value === "number" ? "number" : 
                typeof value === "boolean" ? "boolean" :
                typeof value === "object" ? "json" : "string",
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
