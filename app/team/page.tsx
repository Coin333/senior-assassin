import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import {
  PageBody,
  PageHeader,
  Card,
  CardHeader,
  Stat,
  Badge,
} from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { AddPersonModal } from "@/components/add-person-modal";
import { TeamChat } from "./chat";
import { Users, MessageCircle, ShieldCheck, Calendar } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const assets = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "asset"));
  const family = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.role, "family"));
  const ops = await db
    .select()
    .from(schema.operations)
    .orderBy(desc(schema.operations.createdAt));
  const messages = await db
    .select()
    .from(schema.teamMessages)
    .orderBy(desc(schema.teamMessages.createdAt));
  const activeOps = ops.filter(
    (o) => o.status === "planning" || o.status === "active",
  );

  return (
    <>
      <PageHeader
        meta="COORDINATION // TEAM"
        title="Team"
        subtitle={`${assets.length} assets, ${family.length} contacts. Coordinate ops, share briefs, drop check-ins.`}
        action={<AddPersonModal defaultRole="asset" />}
      />
      <PageBody className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat label="Assets" value={assets.length} color="emerald" />
          </Card>
          <Card>
            <Stat label="Active Ops" value={activeOps.length} color="amber" />
          </Card>
          <Card>
            <Stat label="Messages" value={messages.length} color="indigo" />
          </Card>
          <Card>
            <Stat label="Contacts" value={family.length} color="red" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <Card>
            <CardHeader
              title="Asset Roster"
              action={
                <Link
                  href="/network"
                  className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
                >
                  VIEW NETWORK
                </Link>
              }
            />
            {assets.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <div className="text-sm text-zinc-400">No team assets yet.</div>
                <div className="text-xs text-zinc-600 mt-1">
                  Add your shooter, driver, decoy, or info source.
                </div>
                <div className="mt-4 inline-block">
                  <AddPersonModal defaultRole="asset" />
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {assets.map((a) => (
                  <Link
                    key={a.id}
                    href={`/people/${a.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 group"
                  >
                    <Avatar name={a.name} src={a.photoUrl} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300">
                        {a.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        {a.phone && <span>{a.phone}</span>}
                        {a.notes && (
                          <span className="truncate max-w-xs">{a.notes}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="emerald">ASSET</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Squad Chat"
              action={<MessageCircle className="w-3.5 h-3.5 text-indigo-400" />}
            />
            <TeamChat
              messages={messages.map((m) => ({
                id: m.id,
                authorName: m.authorName,
                content: m.content,
                createdAt: m.createdAt,
              }))}
            />
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Active Operations & Assignments"
            action={
              <Link
                href="/plays"
                className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
              >
                PLAYS
              </Link>
            }
          />
          {activeOps.length === 0 ? (
            <div className="px-6 py-8 text-center text-xs text-zinc-500">
              No active operations.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {activeOps.map((o) => {
                const shooter = assets.find((a) => a.id === o.shooterPersonId);
                const driver = assets.find((a) => a.id === o.driverPersonId);
                return (
                  <div key={o.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100 capitalize">
                          {o.playType.replace(/_/g, " ")}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                          {o.timeWindow || "time unset"}
                        </div>
                      </div>
                      <Badge variant={o.status === "active" ? "red" : "amber"}>
                        {o.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 block">
                          Shooter
                        </span>
                        <span
                          className={
                            shooter ? "text-zinc-200" : "text-zinc-600 italic"
                          }
                        >
                          {shooter?.name || "unassigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 block">
                          Driver
                        </span>
                        <span
                          className={
                            driver ? "text-zinc-200" : "text-zinc-600 italic"
                          }
                        >
                          {driver?.name || "unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </PageBody>
    </>
  );
}
