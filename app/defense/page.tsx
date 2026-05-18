import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { PageBody, PageHeader, Card, CardHeader, Stat } from "@/components/ui";
import { DefenseShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function DefensePage() {
  const suspicious = await db
    .select()
    .from(schema.suspiciousActivity)
    .orderBy(desc(schema.suspiciousActivity.createdAt));
  const routine = await db.select().from(schema.personalRoutine);
  const deceptionPosts = await db
    .select()
    .from(schema.deceptionPosts)
    .orderBy(desc(schema.deceptionPosts.scheduledFor));
  const people = await db.select().from(schema.people);
  const highThreat = people.filter((p) => p.threatLevel === "high").length;

  return (
    <>
      <PageHeader
        meta="DEFENSE // PERSONAL SECURITY"
        title="Defense"
        subtitle="Your own threat watch. Log suspicious activity, audit your routine, schedule deception posts."
      />
      <PageBody className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat
              label="Suspicious Logs"
              value={suspicious.length}
              color={suspicious.length > 0 ? "red" : "emerald"}
            />
          </Card>
          <Card>
            <Stat
              label="High Threats"
              value={highThreat}
              color="amber"
              hint="people in the bracket"
            />
          </Card>
          <Card>
            <Stat
              label="Routine Entries"
              value={routine.length}
              hint="track predictability"
              color="indigo"
            />
          </Card>
          <Card>
            <Stat
              label="Deception Queued"
              value={deceptionPosts.filter((d) => !d.posted).length}
              color="indigo"
            />
          </Card>
        </div>
        <DefenseShell
          suspicious={suspicious.map((s) => ({
            id: s.id,
            description: s.description,
            threatLevel: s.threatLevel,
            createdAt: s.createdAt,
          }))}
          routine={routine.map((r) => ({
            id: r.id,
            dayOfWeek: r.dayOfWeek,
            hour: r.hour,
            activity: r.activity,
            predictabilityScore: r.predictabilityScore,
          }))}
          deception={deceptionPosts.map((d) => ({
            id: d.id,
            platform: d.platform,
            content: d.content,
            scheduledFor: d.scheduledFor,
            posted: d.posted,
          }))}
        />
      </PageBody>
    </>
  );
}
