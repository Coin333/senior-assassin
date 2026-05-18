import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.costs)
    .orderBy(desc(schema.costs.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body?.amount !== "number" || !body?.category) {
    return NextResponse.json(
      { error: "amount and category required" },
      { status: 400 },
    );
  }
  const [row] = await db
    .insert(schema.costs)
    .values({
      amount: body.amount,
      category: body.category,
      description: body.description,
      operationId: body.operationId,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(schema.costs).where(eq(schema.costs.id, id));
  return NextResponse.json({ ok: true });
}
