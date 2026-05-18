import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.suspiciousActivity)
    .orderBy(desc(schema.suspiciousActivity.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.description)
    return NextResponse.json(
      { error: "description required" },
      { status: 400 },
    );
  const [row] = await db
    .insert(schema.suspiciousActivity)
    .values({
      description: body.description,
      locationId: body.locationId,
      suspectedPersonId: body.suspectedPersonId,
      threatLevel: body.threatLevel ?? "low",
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(schema.suspiciousActivity)
    .where(eq(schema.suspiciousActivity.id, id));
  return NextResponse.json({ ok: true });
}
