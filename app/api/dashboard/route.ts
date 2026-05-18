import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const targets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "target"));
  const aliveTargets = targets.filter((t) => t.status === "alive");
  const eliminatedByMe = targets.filter((t) => t.status === "eliminated_me");
  const allPeople = await db.select().from(schema.people);
  const ops = await db
    .select()
    .from(schema.operations)
    .orderBy(desc(schema.operations.createdAt));
  const activeOps = ops.filter(
    (o) => o.status === "planning" || o.status === "active",
  );
  const successfulOps = ops.filter((o) => o.status === "successful");
  const rounds = await db
    .select()
    .from(schema.rounds)
    .orderBy(desc(schema.rounds.weekNumber));
  const recentNotes = await db
    .select()
    .from(schema.notes)
    .orderBy(desc(schema.notes.createdAt))
    .limit(5);
  const suspicious = await db
    .select()
    .from(schema.suspiciousActivity)
    .orderBy(desc(schema.suspiciousActivity.createdAt))
    .limit(5);
  const costs = await db.select().from(schema.costs);
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const settingsRows = await db.select().from(schema.settings);
  const settings: Record<string, string | null> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  return NextResponse.json({
    data: {
      targets,
      aliveTargets,
      eliminatedByMe,
      currentTarget: aliveTargets[0] ?? null,
      allPeopleCount: allPeople.length,
      ops,
      activeOps,
      successfulOps,
      currentRound: rounds[0] ?? null,
      recentNotes,
      suspicious,
      totalCost,
      settings,
    },
  });
}
