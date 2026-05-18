"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Badge, Card, CardHeader } from "@/components/ui";
import { NetworkGraph } from "@/components/network-graph";

type Person = {
  id: string;
  name: string;
  role: string | null;
  side: string | null;
  status: string | null;
  threatLevel: string | null;
  photoUrl: string | null;
};

type Rel = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: string;
};

const TABS: {
  value: string;
  label: string;
  predicate: (p: Person) => boolean;
}[] = [
  { value: "all", label: "All", predicate: () => true },
  { value: "target", label: "Targets", predicate: (p) => p.role === "target" },
  { value: "mine", label: "My team", predicate: (p) => p.side === "mine" },
  {
    value: "target_side",
    label: "Target's team",
    predicate: (p) => p.side === "target" && p.role !== "target",
  },
  {
    value: "family",
    label: "Family",
    predicate: (p) => p.role === "family",
  },
  {
    value: "friend",
    label: "Friends",
    predicate: (p) => p.role === "friend",
  },
  {
    value: "neutral",
    label: "Neutral",
    predicate: (p) => p.side === "neutral" && p.role !== "target",
  },
];

export function NetworkView({
  people,
  relationships,
}: {
  people: Person[];
  relationships: Rel[];
}) {
  const [filter, setFilter] = useState("all");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const activeTab = TABS.find((t) => t.value === filter) ?? TABS[0];
  const filtered = people.filter(activeTab.predicate);
  const counts = TABS.reduce(
    (acc, t) => {
      acc[t.value] = people.filter(t.predicate).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm transition-all border whitespace-nowrap cursor-pointer ${
              filter === t.value
                ? "bg-red-500/15 border-red-500/40 text-red-300"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
            }`}
          >
            {t.label}
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/60 border border-zinc-800">
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Card className="p-0">
          <CardHeader
            title="Connection Web"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                DRAG NODES · CLICK TO OPEN
              </span>
            }
          />
          <NetworkGraph
            people={people}
            relationships={relationships}
            filter={filter}
            focusedId={focusedId}
          />
        </Card>

        <Card>
          <CardHeader
            title="Roster"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {filtered.length}
              </span>
            }
          />
          <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No one in this view.
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className={`px-3 py-2.5 transition-colors ${focusedId === p.id ? "bg-red-500/10" : "hover:bg-zinc-800/30"}`}
                  onMouseEnter={() => setFocusedId(p.id)}
                  onMouseLeave={() => setFocusedId(null)}
                >
                  <Link
                    href={`/people/${p.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar
                      name={p.name}
                      src={p.photoUrl}
                      size={36}
                      status={p.status}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-100 group-hover:text-red-300 truncate">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                          {p.role}
                        </span>
                        {p.role === "target" && p.threatLevel && (
                          <Badge
                            variant={
                              p.threatLevel === "high"
                                ? "red"
                                : p.threatLevel === "low"
                                  ? "emerald"
                                  : "amber"
                            }
                          >
                            {p.threatLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
