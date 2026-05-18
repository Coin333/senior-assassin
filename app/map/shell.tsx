"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";
import { MapView } from "@/components/map-view";
import { MapPin } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  personId: string | null;
  personName: string | null;
  side: string | null;
  observedAt: Date | null;
  createdAt: Date | null;
};

const TYPES = [
  { value: "all", label: "All" },
  { value: "target_home", label: "Target Homes" },
  { value: "snap_check", label: "Snap Checks" },
  { value: "workplace", label: "Workplaces" },
  { value: "hangout", label: "Hangouts" },
  { value: "gas_station", label: "Gas" },
  { value: "gym", label: "Gym" },
  { value: "school", label: "School" },
  { value: "safe_zone", label: "Safe Zones" },
];

export function MapShell({ pins }: { pins: Pin[] }) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? pins : pins.filter((p) => p.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TYPES.map((t) => {
          const count =
            t.value === "all"
              ? pins.length
              : pins.filter((p) => p.type === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all border whitespace-nowrap cursor-pointer ${
                filter === t.value
                  ? "bg-red-500/15 border-red-500/40 text-red-300"
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
              }`}
            >
              {t.label}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/60 border border-zinc-800">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Card className="p-0 overflow-hidden">
          <MapView pins={pins} filter={filter} />
        </Card>

        <Card>
          <CardHeader
            title="Pin List"
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {filtered.length}
              </span>
            }
          />
          <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No pins in this filter.
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="px-3 py-2.5">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        {p.type.replace(/_/g, " ")}
                      </div>
                      {p.personName && (
                        <Link
                          href={`/people/${p.personId}`}
                          className="text-[10px] font-mono text-red-400 hover:underline mt-0.5 block"
                        >
                          {p.personName.toUpperCase()}
                        </Link>
                      )}
                      <div className="text-[10px] text-zinc-600 mt-0.5">
                        {timeAgo(p.observedAt || p.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
