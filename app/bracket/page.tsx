import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import {
  PageBody,
  PageHeader,
  Card,
  CardHeader,
  Stat,
  Badge,
} from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { BracketShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const rounds = await db
    .select()
    .from(schema.rounds)
    .orderBy(desc(schema.rounds.weekNumber));
  const targets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "target"));
  const settingsRows = await db.select().from(schema.settings);
  const settings: Record<string, string | null> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const bracketSize = parseInt(settings.bracket_size || "64", 10);
  const eliminatedByMe = targets.filter(
    (t) => t.status === "eliminated_me",
  ).length;
  const aliveTargets = targets.filter((t) => t.status === "alive");
  const winProb =
    bracketSize > 0
      ? Math.min(
          99,
          Math.round(
            (eliminatedByMe / bracketSize) * 100 + (eliminatedByMe > 0 ? 5 : 0),
          ),
        )
      : 0;

  return (
    <>
      <PageHeader
        meta="LEAGUE // BRACKET"
        title="Bracket"
        subtitle={`Week ${rounds[0]?.weekNumber || 0}. ${eliminatedByMe} kills. League of ${bracketSize}.`}
      />
      <PageBody className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat
              label="Current Week"
              value={rounds[0]?.weekNumber ?? 0}
              color="red"
            />
          </Card>
          <Card>
            <Stat label="My Kills" value={eliminatedByMe} color="emerald" />
          </Card>
          <Card>
            <Stat label="League Size" value={bracketSize} color="indigo" />
          </Card>
          <Card>
            <Stat
              label="Win Probability"
              value={`${winProb}%`}
              hint="rough estimate"
              color="amber"
            />
          </Card>
        </div>

        <BracketShell
          rounds={rounds.map((r) => ({
            id: r.id,
            weekNumber: r.weekNumber,
            targetId: r.targetId,
            outcome: r.outcome,
            method: r.method,
            startDate: r.startDate,
            endDate: r.endDate,
            notes: r.notes,
          }))}
          targets={targets.map((t) => ({
            id: t.id,
            name: t.name,
            photoUrl: t.photoUrl,
            status: t.status,
            threatLevel: t.threatLevel,
            weekAssigned: t.weekAssigned,
          }))}
        />
      </PageBody>
    </>
  );
}
