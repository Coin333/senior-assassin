import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Avatar } from "@/components/avatar";
import {
  Badge,
  Card,
  CardHeader,
  PageBody,
  PageHeader,
  Stat,
} from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, Crosshair, Eye, Radio, Swords } from "lucide-react";
import { AddPersonModal } from "@/components/add-person-modal";
import { HomeQuickActions } from "@/components/quick-actions";

export const dynamic = "force-dynamic";

async function loadDashboard() {
  const targets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "target"));
  const alive = targets.filter((t) => t.status === "alive");
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
  const recentNotes = await db
    .select()
    .from(schema.notes)
    .orderBy(desc(schema.notes.createdAt))
    .limit(5);
  const suspicious = await db
    .select()
    .from(schema.suspiciousActivity)
    .orderBy(desc(schema.suspiciousActivity.createdAt))
    .limit(4);
  const costs = await db.select().from(schema.costs);
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const settingsRows = await db.select().from(schema.settings);
  const settings: Record<string, string | null> = {};
  for (const r of settingsRows) settings[r.key] = r.value;
  const successRate = ops.length
    ? Math.round((successfulOps.length / ops.length) * 100)
    : 0;
  return {
    alive,
    eliminatedByMe,
    targets,
    allPeople,
    activeOps,
    successfulOps,
    ops,
    recentNotes,
    suspicious,
    totalCost,
    settings,
    successRate,
  };
}

export default async function Dashboard() {
  const d = await loadDashboard();
  const current = d.alive[0];
  const endgame = d.settings.endgame_mode === "true";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        meta={`OPERATIONAL BRIEF // ${today.toUpperCase()}`}
        title={endgame ? "Endgame Mode" : "Daily Brief"}
        subtitle={
          current
            ? `Active contract: ${current.name}. Stay invisible. Strike when the seam opens.`
            : "No active target assigned. Add a target to begin operations."
        }
        action={<AddPersonModal defaultRole="target" />}
      />
      <PageBody className="space-y-6">
        <HomeQuickActions
          targets={d.allPeople
            .filter((p) => p.role === "target")
            .map((t) => ({ id: t.id, name: t.name }))}
          recentTargets={d.alive.map((t) => ({ id: t.id, name: t.name }))}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat
              label="Alive Targets"
              value={d.alive.length}
              hint={`of ${d.targets.length} assigned`}
              color="emerald"
            />
          </Card>
          <Card>
            <Stat
              label="Confirmed Kills"
              value={d.eliminatedByMe.length}
              hint={`${d.successRate}% success rate`}
              color="red"
            />
          </Card>
          <Card>
            <Stat
              label="Active Ops"
              value={d.activeOps.length}
              hint="planning or in progress"
              color="amber"
            />
          </Card>
          <Card>
            <Stat
              label="Ops Spend"
              value={`$${d.totalCost.toFixed(0)}`}
              hint="bribes, food, supplies"
              color="indigo"
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <CardHeader
              title="Current Contract"
              action={current && <Badge variant="red">PRIORITY</Badge>}
            />
            {current ? (
              <Link href={`/people/${current.id}`} className="block group">
                <div className="p-5 flex gap-5 relative">
                  <Avatar
                    name={current.name}
                    src={current.photoUrl}
                    size={80}
                    status={current.status}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant={
                          current.threatLevel === "high"
                            ? "red"
                            : current.threatLevel === "low"
                              ? "emerald"
                              : "amber"
                        }
                      >
                        {current.threatLevel} threat
                      </Badge>
                      {current.weekAssigned && (
                        <Badge variant="outline">
                          Week {current.weekAssigned}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-50 group-hover:text-red-300 transition-colors">
                      {current.name}
                    </h2>
                    <div className="mt-2 text-sm text-zinc-400 space-y-0.5">
                      {current.address && (
                        <div className="flex gap-2">
                          <span className="text-zinc-600 font-mono text-[10px] mt-0.5">
                            ADDR
                          </span>
                          <span>{current.address}</span>
                        </div>
                      )}
                      {current.vehicleMake && (
                        <div className="flex gap-2">
                          <span className="text-zinc-600 font-mono text-[10px] mt-0.5">
                            VEH
                          </span>
                          <span>
                            {current.vehicleColor} {current.vehicleMake}{" "}
                            {current.vehicleModel}
                            {current.vehiclePlate &&
                              ` · ${current.vehiclePlate}`}
                          </span>
                        </div>
                      )}
                      {current.workplace && (
                        <div className="flex gap-2">
                          <span className="text-zinc-600 font-mono text-[10px] mt-0.5">
                            WORK
                          </span>
                          <span>{current.workplace}</span>
                        </div>
                      )}
                    </div>
                    {current.patternSummary && (
                      <p className="mt-3 text-sm text-zinc-300 border-l-2 border-red-500/40 pl-3">
                        {current.patternSummary}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No target.{" "}
                <Link href="/targets" className="text-red-400 hover:underline">
                  Add one
                </Link>
                .
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Threat Sweep"
              action={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            />
            {d.suspicious.length === 0 ? (
              <div className="p-5 text-center text-xs text-zinc-500">
                No suspicious activity logged.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {d.suspicious.map((s) => (
                  <div key={s.id} className="px-4 py-2.5">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full ${s.threatLevel === "high" ? "bg-red-500" : s.threatLevel === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 line-clamp-2">
                          {s.description}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                          {timeAgo(s.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/defense"
              className="block px-4 py-2 border-t border-zinc-800/60 text-[11px] font-mono tracking-wider text-zinc-500 hover:text-red-400"
            >
              VIEW DEFENSE LOG
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card>
            <CardHeader
              title="Active Operations"
              action={<Swords className="w-3.5 h-3.5 text-amber-400" />}
            />
            {d.activeOps.length === 0 ? (
              <div className="p-5 text-center text-xs text-zinc-500">
                No active ops.{" "}
                <Link href="/plays" className="text-red-400 hover:underline">
                  Plan one
                </Link>
                .
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {d.activeOps.slice(0, 4).map((o) => {
                  const target = d.targets.find((t) => t.id === o.targetId);
                  return (
                    <Link
                      key={o.id}
                      href={`/plays?op=${o.id}`}
                      className="block px-4 py-3 hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-200 truncate capitalize">
                            {o.playType.replace(/_/g, " ")}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            vs {target?.name || "unknown"}
                          </div>
                        </div>
                        <Badge
                          variant={o.status === "active" ? "red" : "amber"}
                        >
                          {o.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Recent Intel"
              action={<Eye className="w-3.5 h-3.5 text-indigo-400" />}
            />
            {d.recentNotes.length === 0 ? (
              <div className="p-5 text-center text-xs text-zinc-500">
                No intel logged.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {d.recentNotes.map((n) => {
                  const subject = d.allPeople.find((p) => p.id === n.personId);
                  return (
                    <div key={n.id} className="px-4 py-2.5">
                      <p className="text-xs text-zinc-300 line-clamp-2">
                        {n.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {subject && (
                          <Link
                            href={`/people/${subject.id}`}
                            className="text-[10px] font-mono text-red-400 hover:underline"
                          >
                            {subject.name.toUpperCase()}
                          </Link>
                        )}
                        <span className="text-[10px] font-mono text-zinc-600">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Pre-Strike Checklist"
              action={<Radio className="w-3.5 h-3.5 text-emerald-400" />}
            />
            <ul className="p-4 space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Backseat
                check before driving
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Confirm
                target home (Snap Map)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Parents
                away verified
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Shooter
                pre-positioned
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Getaway
                driver running
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> GoPro
                recording (post-strike)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600 font-mono">[ ]</span> Abort
                criteria reviewed
              </li>
            </ul>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Active Kill List"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {d.alive.length} CONFIRMED ALIVE
              </span>
            }
          />
          <div className="divide-y divide-zinc-800/60">
            {d.alive.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500">
                No live targets.
              </div>
            ) : (
              d.alive.map((t) => (
                <Link
                  key={t.id}
                  href={`/people/${t.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/30 group transition-colors"
                >
                  <Avatar
                    name={t.name}
                    src={t.photoUrl}
                    size={42}
                    status={t.status}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-zinc-100 group-hover:text-red-300 truncate">
                        {t.name}
                      </div>
                      {t.weekAssigned && (
                        <Badge variant="outline">W{t.weekAssigned}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 truncate">
                      {[
                        t.address,
                        t.vehicleMake && `${t.vehicleColor} ${t.vehicleMake}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
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
                  <span className="text-zinc-600 group-hover:text-red-400 text-xs font-mono">
                    →
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </PageBody>
    </>
  );
}
