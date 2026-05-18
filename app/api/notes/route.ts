import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get("personId");
  const q = personId
    ? db
        .select()
        .from(schema.notes)
        .where(eq(schema.notes.personId, personId))
        .orderBy(desc(schema.notes.createdAt))
    : db.select().from(schema.notes).orderBy(desc(schema.notes.createdAt));
  const rows = await q;
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.content)
    return NextResponse.json({ error: "content required" }, { status: 400 });
  const [row] = await db
    .insert(schema.notes)
    .values({
      personId: body.personId,
      content: body.content,
      source: body.source,
      category: body.category ?? "observation",
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(schema.notes).where(eq(schema.notes.id, id));
  return NextResponse.json({ ok: true });
}
