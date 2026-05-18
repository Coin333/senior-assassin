import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { Avatar } from "@/components/avatar";
import {
  Badge,
  Card,
  CardHeader,
  PageBody,
  PageHeader,
  Empty,
} from "@/components/ui";
import { AddPersonModal } from "@/components/add-person-modal";
import { Crosshair } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const targets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "target"))
    .orderBy(desc(schema.people.createdAt));
  const weeks = new Map<number | null, typeof targets>();
  for (const t of targets) {
    const key = t.weekAssigned ?? null;
    if (!weeks.has(key)) weeks.set(key, [] as typeof targets);
    weeks.get(key)!.push(t);
  }
  const sortedWeeks = Array.from(weeks.keys()).sort(
    (a, b) => (b ?? 0) - (a ?? 0),
  );
  const aliveCount = targets.filter((t) => t.status === "alive").length;
  const killCount = targets.filter((t) => t.status === "eliminated_me").length;

  return (
    <>
      <PageHeader
        meta="DOSSIER // ACTIVE CONTRACTS"
        title="Targets"
        subtitle={`${aliveCount} alive, ${killCount} eliminated by you, ${targets.length} total tracked`}
        action={<AddPersonModal defaultRole="target" />}
      />
      <PageBody>
        {targets.length === 0 ? (
          <Card>
            <Empty
              icon={Crosshair}
              title="No targets yet"
              hint="Add your first target to build your dossier."
              action={<AddPersonModal defaultRole="target" />}
            />
          </Card>
        ) : (
          <div className="space-y-5">
            {sortedWeeks.map((week) => {
              const list = weeks.get(week)!;
              const label = week === null ? "Unassigned" : `Week ${week}`;
              return (
                <Card key={`w-${week ?? "na"}`}>
                  <CardHeader
                    title={label}
                    action={
                      <span className="text-[10px] font-mono text-zinc-500">
                        {list.length} TARGETS
                      </span>
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/60">
                    {list.map((t) => (
                      <Link
                        key={t.id}
                        href={`/people/${t.id}`}
                        className="block p-4 hover:bg-zinc-800/30 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            name={t.name}
                            src={t.photoUrl}
                            size={48}
                            status={t.status}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-semibold text-zinc-100 group-hover:text-red-300 truncate">
                                {t.name}
                              </div>
                              <Badge
                                variant={
                                  t.status === "alive"
                                    ? "emerald"
                                    : t.status === "eliminated_me"
                                      ? "red"
                                      : "default"
                                }
                              >
                                {t.status?.replace("_", " ")}
                              </Badge>
                              <Badge
                                variant={
                                  t.threatLevel === "high"
                                    ? "red"
                                    : t.threatLevel === "low"
                                      ? "emerald"
                                      : "amber"
                                }
                              >
                                {t.threatLevel}
                              </Badge>
                            </div>
                            <div className="mt-1.5 text-xs text-zinc-500 space-y-0.5">
                              {t.address && (
                                <div className="truncate">
                                  <span className="font-mono text-[9px] text-zinc-600">
                                    ADDR
                                  </span>{" "}
                                  {t.address}
                                </div>
                              )}
                              {t.vehicleMake && (
                                <div className="truncate">
                                  <span className="font-mono text-[9px] text-zinc-600">
                                    VEH
                                  </span>{" "}
                                  {t.vehicleColor} {t.vehicleMake}{" "}
                                  {t.vehicleModel}
                                  {t.vehiclePlate && (
                                    <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700">
                                      {t.vehiclePlate}
                                    </span>
                                  )}
                                </div>
                              )}
                              {t.workplace && (
                                <div className="truncate">
                                  <span className="font-mono text-[9px] text-zinc-600">
                                    WORK
                                  </span>{" "}
                                  {t.workplace}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
