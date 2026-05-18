import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get("personId");
  const rows = personId
    ? await db
        .select()
        .from(schema.scheduleEntries)
        .where(eq(schema.scheduleEntries.personId, personId))
    : await db.select().from(schema.scheduleEntries);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (
    !body?.personId ||
    body?.dayOfWeek === undefined ||
    body?.hour === undefined ||
    !body?.activity
  ) {
    return NextResponse.json(
      { error: "personId, dayOfWeek, hour, activity required" },
      { status: 400 },
    );
  }
  const [row] = await db
    .insert(schema.scheduleEntries)
    .values({
      personId: body.personId,
      dayOfWeek: body.dayOfWeek,
      hour: body.hour,
      activity: body.activity,
      locationId: body.locationId,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(schema.scheduleEntries)
    .where(eq(schema.scheduleEntries.id, id));
  return NextResponse.json({ ok: true });
}
