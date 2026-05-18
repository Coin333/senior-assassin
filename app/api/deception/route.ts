import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.deceptionPosts)
    .orderBy(desc(schema.deceptionPosts.scheduledFor));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.platform || !body?.content)
    return NextResponse.json(
      { error: "platform and content required" },
      { status: 400 },
    );
  const [row] = await db
    .insert(schema.deceptionPosts)
    .values({
      platform: body.platform,
      content: body.content,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      posted: body.posted ?? false,
    })
    .returning();
  return NextResponse.json({ data: row });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (!body?.id)
    return NextResponse.json({ error: "id required" }, { status: 400 });
  const { id, ...rest } = body;
  if (rest.scheduledFor) rest.scheduledFor = new Date(rest.scheduledFor);
  const [row] = await db
    .update(schema.deceptionPosts)
    .set(rest)
    .where(eq(schema.deceptionPosts.id, id))
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(schema.deceptionPosts)
    .where(eq(schema.deceptionPosts.id, id));
  return NextResponse.json({ ok: true });
}
