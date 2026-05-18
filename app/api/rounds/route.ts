import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.rounds)
    .orderBy(desc(schema.rounds.weekNumber));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(schema.rounds)
    .values({
      weekNumber: body.weekNumber,
      targetId: body.targetId,
      outcome: body.outcome,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      method: body.method,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (!body?.id)
    return NextResponse.json({ error: "id required" }, { status: 400 });
  const { id, ...rest } = body;
  if (rest.startDate) rest.startDate = new Date(rest.startDate);
  if (rest.endDate) rest.endDate = new Date(rest.endDate);
  const [row] = await db
    .update(schema.rounds)
    .set(rest)
    .where(eq(schema.rounds.id, id))
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(schema.rounds).where(eq(schema.rounds.id, id));
  return NextResponse.json({ ok: true });
}
