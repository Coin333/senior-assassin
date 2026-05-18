import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const rows = role
    ? await db
        .select()
        .from(schema.people)
        .where(eq(schema.people.role, role))
        .orderBy(desc(schema.people.createdAt))
    : await db
        .select()
        .from(schema.people)
        .orderBy(desc(schema.people.createdAt));
  return NextResponse.json({ data: rows });
}

function inferSide(role: string, requested?: string) {
  if (requested) return requested;
  if (role === "target") return "target";
  if (role === "ally") return "mine";
  return "neutral";
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name)
    return NextResponse.json({ error: "name required" }, { status: 400 });

  const role = body.role ?? "neutral";
  const side = inferSide(role, body.side);

  const [row] = await db
    .insert(schema.people)
    .values({
      name: body.name,
      role,
      side,
      associatedTargetId: body.associatedTargetId ?? null,
      relationshipToTarget: body.relationshipToTarget ?? null,
      status: body.status ?? "alive",
      threatLevel: body.threatLevel ?? "medium",
      photoUrl: body.photoUrl,
      phone: body.phone,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      vehicleMake: body.vehicleMake,
      vehicleModel: body.vehicleModel,
      vehicleColor: body.vehicleColor,
      vehicleYear: body.vehicleYear,
      vehiclePlate: body.vehiclePlate,
      vehiclePhotoUrl: body.vehiclePhotoUrl,
      workplace: body.workplace,
      workplaceAddress: body.workplaceAddress,
      workSchedule: body.workSchedule,
      romanticInterestId: body.romanticInterestId,
      weekAssigned: body.weekAssigned,
      snapchatHandle: body.snapchatHandle,
      instagramHandle: body.instagramHandle,
      tiktokHandle: body.tiktokHandle,
      beRealHandle: body.beRealHandle,
      stravaHandle: body.stravaHandle,
      spotifyHandle: body.spotifyHandle,
      venmoHandle: body.venmoHandle,
      snapMapVisible: body.snapMapVisible,
      parentSchedule: body.parentSchedule,
      houseMapSketchUrl: body.houseMapSketchUrl,
      patternSummary: body.patternSummary,
      notes: body.notes,
    })
    .returning();

  // Auto-create a relationship row when person is linked to a target.
  if (body.associatedTargetId && body.relationshipToTarget) {
    try {
      await db.insert(schema.relationships).values({
        fromPersonId: body.associatedTargetId,
        toPersonId: row.id,
        type: body.relationshipToTarget,
        strength: 6,
      });
    } catch {
      // Silent skip if target id was invalid.
    }
  }

  if (role === "target" && (body.lat || body.address)) {
    await db.insert(schema.locations).values({
      name: `${row.name} - Home`,
      lat: body.lat,
      lng: body.lng,
      address: body.address,
      type: "target_home",
      personId: row.id,
    });
  }
  return NextResponse.json({ data: row });
}
