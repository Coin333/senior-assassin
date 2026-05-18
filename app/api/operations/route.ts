import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const rows = targetId
    ? await db
        .select()
        .from(schema.operations)
        .where(eq(schema.operations.targetId, targetId))
        .orderBy(desc(schema.operations.createdAt))
    : await db
        .select()
        .from(schema.operations)
        .orderBy(desc(schema.operations.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.targetId || !body?.playType)
    return NextResponse.json(
      { error: "targetId and playType required" },
      { status: 400 },
    );
  const [row] = await db
    .insert(schema.operations)
    .values({
      targetId: body.targetId,
      playType: body.playType,
      status: body.status ?? "planning",
      plannedFor: body.plannedFor ? new Date(body.plannedFor) : null,
      approach: body.approach,
      exit: body.exit,
      primaryBait: body.primaryBait,
      backupBait: body.backupBait,
      abortCriteria: body.abortCriteria,
      equipment: body.equipment,
      parentsStatus: body.parentsStatus,
      knownAllies: body.knownAllies,
      timeWindow: body.timeWindow,
      locationId: body.locationId,
      shooterPersonId: body.shooterPersonId,
      driverPersonId: body.driverPersonId,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json({ data: row });
}
