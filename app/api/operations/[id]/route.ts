import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  if (body.plannedFor) body.plannedFor = new Date(body.plannedFor);
  if (body.executedAt) body.executedAt = new Date(body.executedAt);
  const [row] = await db
    .update(schema.operations)
    .set(body)
    .where(eq(schema.operations.id, id))
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(schema.operations).where(eq(schema.operations.id, id));
  return NextResponse.json({ ok: true });
}
