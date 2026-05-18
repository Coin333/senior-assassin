import Link from "next/link";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { desc, eq, or, ne, and } from "drizzle-orm";
import { Avatar } from "@/components/avatar";
import {
  Badge,
  Card,
  CardHeader,
  PageBody,
  PageHeader,
  Stat,
} from "@/components/ui";
import {
  StatusButtons,
  ThreatToggle,
  AddNoteForm,
  AddLocationForm,
  PersonFieldEditor,
  ScheduleGrid,
  DeletePersonButton,
  AddRelationshipForm,
  SocialMediaEditor,
  AllegianceEditor,
} from "@/components/person-actions";
import { timeAgo, statusLabel } from "@/lib/utils";
import {
  ArrowLeft,
  Car,
  Briefcase,
  Heart,
  Home,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Users,
  Camera,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person] = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.id, id));
  if (!person) notFound();

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
  const allPeople = await db.select().from(schema.people);
  const peopleMap = new Map(allPeople.map((p) => [p.id, p]));
  const otherPeople = allPeople.filter((p) => p.id !== id);

  const connections = rels
    .map((r) => {
      const otherId = r.fromPersonId === id ? r.toPersonId : r.fromPersonId;
      return { rel: r, person: peopleMap.get(otherId)! };
    })
    .filter((c) => c.person);

  const romantic = person.romanticInterestId
    ? peopleMap.get(person.romanticInterestId)
    : null;
  const isTarget = person.role === "target";

  return (
    <>
      <PageHeader
        meta={
          <Link
            href={isTarget ? "/targets" : "/network"}
            className="hover:text-zinc-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> {isTarget ? "TARGETS" : "NETWORK"}
          </Link>
        }
        title={person.name}
        subtitle={
          person.role === "target"
            ? "Active contract dossier"
            : person.role === "asset"
              ? "Your team asset"
              : person.role === "friend"
                ? "Connection in the network"
                : "Person of interest"
        }
        action={
          <div className="flex items-center gap-2">
            {isTarget && (
              <StatusButtons id={person.id} status={person.status} />
            )}
            <DeletePersonButton id={person.id} name={person.name} />
          </div>
        }
      />
      <PageBody className="space-y-5">
        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-5 p-5 relative">
            <Avatar
              name={person.name}
              src={person.photoUrl}
              size={128}
              status={person.status}
            />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    person.role === "target"
                      ? "red"
                      : person.role === "asset"
                        ? "emerald"
                        : "indigo"
                  }
                >
                  {person.role}
                </Badge>
                {person.status && person.role === "target" && (
                  <Badge
                    variant={
                      person.status === "alive"
                        ? "emerald"
                        : person.status === "eliminated_me"
                          ? "red"
                          : "default"
                    }
                  >
                    {statusLabel(person.status)}
                  </Badge>
                )}
                {person.weekAssigned && (
                  <Badge variant="outline">Week {person.weekAssigned}</Badge>
                )}
                <div className="ml-auto">
                  <ThreatToggle id={person.id} level={person.threatLevel} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                <DetailField
                  icon={Home}
                  label="Address"
                  value={person.address}
                />
                <DetailField
                  icon={Car}
                  label="Vehicle"
                  value={
                    person.vehicleMake
                      ? `${person.vehicleColor || ""} ${person.vehicleMake} ${person.vehicleModel || ""}`
                      : null
                  }
                  extra={person.vehiclePlate}
                />
                <DetailField
                  icon={Briefcase}
                  label="Workplace"
                  value={person.workplace}
                />
                <DetailField icon={Phone} label="Phone" value={person.phone} />
                <DetailField
                  icon={Heart}
                  label="Romantic Interest"
                  value={romantic ? romantic.name : null}
                  link={romantic ? `/people/${romantic.id}` : null}
                />
                <DetailField
                  icon={Clock}
                  label="Parents Home"
                  value={person.parentSchedule}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Allegiance" />
              <AllegianceEditor
                id={person.id}
                side={person.side}
                role={person.role}
                associatedTargetId={person.associatedTargetId}
                relationshipToTarget={person.relationshipToTarget}
                targets={allPeople
                  .filter((p) => p.role === "target" && p.id !== person.id)
                  .map((p) => ({ id: p.id, name: p.name }))}
              />
            </Card>
            <Card>
              <CardHeader title="Socials" />
              <SocialMediaEditor
                id={person.id}
                values={{
                  snapchatHandle: person.snapchatHandle,
                  instagramHandle: person.instagramHandle,
                  tiktokHandle: person.tiktokHandle,
                  beRealHandle: person.beRealHandle,
                  stravaHandle: person.stravaHandle,
                  spotifyHandle: person.spotifyHandle,
                  venmoHandle: person.venmoHandle,
                }}
              />
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader
              title="Pattern of Life"
              action={
                <span className="text-[10px] font-mono text-zinc-500">
                  EDITABLE SUMMARY
                </span>
              }
            />
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                  Routine snapshot
                </div>
                <PersonFieldEditor
                  id={person.id}
                  field="patternSummary"
                  value={person.patternSummary}
                  label="Pattern"
                  placeholder="Wakes ~7am. School 8-3. Practice 4-6 M/W/F. Closes at Chick-fil-A Thu/Sat..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Intel Logged" value={personNotes.length} />
                <Stat label="Locations Pinned" value={personLocations.length} />
                <Stat label="Connections" value={connections.length} />
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Weekly Schedule Grid"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {personSchedule.length} ENTRIES
              </span>
            }
          />
          <ScheduleGrid personId={person.id} schedule={personSchedule} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader
              title="Connections"
              action={
                <Link
                  href="/network"
                  className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
                >
                  VIEW NETWORK
                </Link>
              }
            />
            {connections.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No links yet. Build out their circle below.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {connections.map(({ rel, person: p }) => (
                  <Link
                    key={rel.id}
                    href={`/people/${p.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30"
                  >
                    <Avatar name={p.name} src={p.photoUrl} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {rel.type}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
            <AddRelationshipForm
              personId={person.id}
              candidates={otherPeople}
            />
          </Card>

          <Card>
            <CardHeader
              title="Pinned Locations"
              action={
                <Link
                  href="/map"
                  className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
                >
                  OPEN MAP
                </Link>
              }
            />
            {personLocations.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No locations pinned. Drop a Snap Map check or hangout below.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {personLocations.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">
                        {l.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {l.type.replace(/_/g, " ")} · {timeAgo(l.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <AddLocationForm personId={person.id} />
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Intel Timeline"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {personNotes.length} ENTRIES
              </span>
            }
          />
          {personNotes.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-zinc-500">
              No intel logged. Drop your first observation below.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {personNotes.map((n) => (
                <div key={n.id} className="px-5 py-3">
                  <p className="text-sm text-zinc-300">{n.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-600">
                      {timeAgo(n.createdAt)}
                    </span>
                    {n.source && (
                      <span className="text-[10px] font-mono text-indigo-400">
                        VIA {n.source.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <AddNoteForm
            personId={person.id}
            allPeople={otherPeople.map((p) => ({ id: p.id, name: p.name }))}
          />
        </Card>

        {isTarget && (
          <Card>
            <CardHeader
              title="Operations Against This Target"
              action={
                <Link
                  href="/plays"
                  className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
                >
                  PLAN NEW OP
                </Link>
              }
            />
            {personOps.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No operations planned yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {personOps.map((o) => (
                  <Link
                    key={o.id}
                    href={`/plays?op=${o.id}`}
                    className="block px-5 py-3 hover:bg-zinc-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100 capitalize">
                          {o.playType.replace(/_/g, " ")}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {o.timeWindow || "No time set"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          o.status === "successful"
                            ? "emerald"
                            : o.status === "active"
                              ? "red"
                              : o.status === "aborted" || o.status === "failed"
                                ? "default"
                                : "amber"
                        }
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}
      </PageBody>
    </>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  extra,
  link,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
  extra?: string | null;
  link?: string | null;
}) {
  if (!value) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Icon className="w-3.5 h-3.5 text-zinc-700" />
        <span className="text-[10px] font-mono uppercase tracking-wider">
          {label}
        </span>
        <span className="italic">unknown</span>
      </div>
    );
  }
  const inner = (
    <>
      <Icon className="w-3.5 h-3.5 text-zinc-500" />
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className="text-sm text-zinc-200 truncate">{value}</span>
      {extra && (
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-400">
          {extra}
        </span>
      )}
    </>
  );
  if (link)
    return (
      <Link
        href={link}
        className="flex items-center gap-2 hover:text-red-300 group"
      >
        {inner}
      </Link>
    );
  return <div className="flex items-center gap-2">{inner}</div>;
}

function SocialRow({
  icon: Icon,
  label,
  handle,
  active,
}: {
  icon: any;
  label: string;
  handle: string | null | undefined;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Icon
        className={`w-3.5 h-3.5 ${handle ? "text-zinc-400" : "text-zinc-700"}`}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 w-16">
        {label}
      </span>
      <span
        className={`text-xs ${handle ? "text-zinc-200" : "text-zinc-600 italic"} flex-1 truncate`}
      >
        {handle || "not tracked"}
      </span>
      {active && (
        <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
          live
        </span>
      )}
    </div>
  );
}
