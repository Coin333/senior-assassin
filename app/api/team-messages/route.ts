import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const operationId = searchParams.get("operationId");
  const rows = operationId
    ? await db
        .select()
        .from(schema.teamMessages)
        .where(eq(schema.teamMessages.operationId, operationId))
        .orderBy(desc(schema.teamMessages.createdAt))
    : await db
        .select()
        .from(schema.teamMessages)
        .orderBy(desc(schema.teamMessages.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.content || !body?.authorName)
    return NextResponse.json(
      { error: "authorName and content required" },
      { status: 400 },
    );
  const [row] = await db
    .insert(schema.teamMessages)
    .values({
      operationId: body.operationId,
      authorName: body.authorName,
      content: body.content,
    })
    .returning();
  return NextResponse.json({ data: row });
}
