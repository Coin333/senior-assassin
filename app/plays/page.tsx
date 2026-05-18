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
import { PlayShell } from "./shell";
import { PLAYBOOK, STALLS } from "@/lib/utils";
import { Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlaysPage() {
  const ops = await db
    .select()
    .from(schema.operations)
    .orderBy(desc(schema.operations.createdAt));
  const targets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "target"));
  const assets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "asset"));
  const equipmentItems = await db.select().from(schema.equipmentItems);

  const targetMap = new Map(targets.map((t) => [t.id, t]));
  const opsWithTarget = ops.map((o) => ({
    ...o,
    target: targetMap.get(o.targetId),
  }));

  return (
    <>
      <PageHeader
        meta="OPERATIONS // PLAYBOOK"
        title="Plays"
        subtitle="Run the canon plays, build custom ops, draft kill briefs. Stalls and equipment included."
      />
      <PageBody className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat
              label="Active Ops"
              value={
                ops.filter(
                  (o) => o.status === "planning" || o.status === "active",
                ).length
              }
              color="amber"
            />
          </Card>
          <Card>
            <Stat
              label="Successful"
              value={ops.filter((o) => o.status === "successful").length}
              color="emerald"
            />
          </Card>
          <Card>
            <Stat
              label="Aborted/Failed"
              value={
                ops.filter(
                  (o) => o.status === "aborted" || o.status === "failed",
                ).length
              }
              color="red"
            />
          </Card>
          <Card>
            <Stat
              label="Playbook"
              value={PLAYBOOK.length}
              hint="canon schemes"
              color="indigo"
            />
          </Card>
        </div>

        <PlayShell
          ops={opsWithTarget.map((o) => ({
            id: o.id,
            playType: o.playType,
            status: o.status,
            targetId: o.targetId,
            targetName: o.target?.name || "unknown",
            timeWindow: o.timeWindow,
            primaryBait: o.primaryBait,
            backupBait: o.backupBait,
            approach: o.approach,
            exit: o.exit,
            abortCriteria: o.abortCriteria,
            parentsStatus: o.parentsStatus,
            knownAllies: o.knownAllies,
            notes: o.notes,
            equipment: o.equipment,
            shooterPersonId: o.shooterPersonId,
            driverPersonId: o.driverPersonId,
            createdAt: o.createdAt,
            plannedFor: o.plannedFor,
            result: o.result,
          }))}
          targets={targets.map((t) => ({
            id: t.id,
            name: t.name,
            status: t.status,
            photoUrl: t.photoUrl,
            threatLevel: t.threatLevel,
            address: t.address,
            vehicleMake: t.vehicleMake,
            vehicleModel: t.vehicleModel,
            vehicleColor: t.vehicleColor,
            vehiclePlate: t.vehiclePlate,
            workplace: t.workplace,
          }))}
          assets={assets.map((a) => ({ id: a.id, name: a.name }))}
          equipment={equipmentItems}
        />
      </PageBody>
    </>
  );
}
