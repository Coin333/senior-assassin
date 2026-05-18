import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(schema.equipmentItems);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name)
    return NextResponse.json({ error: "name required" }, { status: 400 });
  const [row] = await db
    .insert(schema.equipmentItems)
    .values({
      name: body.name,
      owned: body.owned ?? false,
      category: body.category,
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
  const [row] = await db
    .update(schema.equipmentItems)
    .set(rest)
    .where(eq(schema.equipmentItems.id, id))
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(schema.equipmentItems)
    .where(eq(schema.equipmentItems.id, id));
  return NextResponse.json({ ok: true });
}
