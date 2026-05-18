import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, or, desc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [person] = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.id, id));
  if (!person)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  const personNotes = await db
    .select()
    .from(schema.notes)
    .where(eq(schema.notes.personId, id))
    .orderBy(desc(schema.notes.createdAt));
  const personLocations = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.personId, id))
    .orderBy(desc(schema.locations.createdAt));
  const personSchedule = await db
    .select()
    .from(schema.scheduleEntries)
    .where(eq(schema.scheduleEntries.personId, id));
  const personPhotos = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.personId, id));
  const personOps = await db
    .select()
    .from(schema.operations)
    .where(eq(schema.operations.targetId, id))
    .orderBy(desc(schema.operations.createdAt));
  const rels = await db
    .select()
    .from(schema.relationships)
    .where(
      or(
        eq(schema.relationships.fromPersonId, id),
        eq(schema.relationships.toPersonId, id),
      ),
    );

  return NextResponse.json({
    data: {
      ...person,
      notes: personNotes,
      locations: personLocations,
      schedule: personSchedule,
      photos: personPhotos,
      operations: personOps,
      relationships: rels,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(schema.people)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schema.people.id, id))
    .returning();
  return NextResponse.json({ data: row });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(schema.people).where(eq(schema.people.id, id));
  return NextResponse.json({ ok: true });
}
