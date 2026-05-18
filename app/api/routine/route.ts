import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(schema.personalRoutine);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (
    body?.dayOfWeek === undefined ||
    body?.hour === undefined ||
    !body?.activity
  ) {
    return NextResponse.json(
      { error: "dayOfWeek, hour, activity required" },
      { status: 400 },
    );
  }
  const [row] = await db
    .insert(schema.personalRoutine)
    .values({
      dayOfWeek: body.dayOfWeek,
      hour: body.hour,
      activity: body.activity,
      locationId: body.locationId,
      predictabilityScore: body.predictabilityScore ?? 5,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(schema.personalRoutine)
    .where(eq(schema.personalRoutine.id, id));
  return NextResponse.json({ ok: true });
}
