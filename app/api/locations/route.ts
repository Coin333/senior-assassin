import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(schema.locations)
    .orderBy(desc(schema.locations.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name || !body?.type)
    return NextResponse.json(
      { error: "name and type required" },
      { status: 400 },
    );
  const [row] = await db
    .insert(schema.locations)
    .values({
      name: body.name,
      lat: body.lat,
      lng: body.lng,
      address: body.address,
      type: body.type,
      personId: body.personId,
      notes: body.notes,
      observedAt: body.observedAt ? new Date(body.observedAt) : new Date(),
    })
    .returning();
  return NextResponse.json({ data: row });
}
