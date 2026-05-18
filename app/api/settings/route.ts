import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(schema.settings);
  const map: Record<string, string | null> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({ data: map });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.key)
    return NextResponse.json({ error: "key required" }, { status: 400 });
  const existing = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, body.key));
  if (existing.length) {
    await db
      .update(schema.settings)
      .set({ value: body.value })
      .where(eq(schema.settings.key, body.key));
  } else {
    await db
      .insert(schema.settings)
      .values({ key: body.key, value: body.value });
  }
  return NextResponse.json({ ok: true });
}
