import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(schema.relationships);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.fromPersonId || !body?.toPersonId || !body?.type) {
    return NextResponse.json(
      { error: "fromPersonId, toPersonId, type required" },
      { status: 400 },
    );
  }
  const [row] = await db
    .insert(schema.relationships)
    .values({
      fromPersonId: body.fromPersonId,
      toPersonId: body.toPersonId,
      type: body.type,
      strength: body.strength ?? 5,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(schema.relationships).where(eq(schema.relationships.id, id));
  return NextResponse.json({ ok: true });
}
