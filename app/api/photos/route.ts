import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get("personId");
  if (!personId) {
    return NextResponse.json({ error: "personId required" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.personId, personId))
    .orderBy(desc(schema.photos.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.personId || !body?.url) {
    return NextResponse.json(
      { error: "personId and url required" },
      { status: 400 },
    );
  }
  const [row] = await db
    .insert(schema.photos)
    .values({
      personId: body.personId,
      url: body.url,
      caption: body.caption,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(schema.photos).where(eq(schema.photos.id, id));
  return NextResponse.json({ ok: true });
}
