"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), {
  ssr: false,
});

type LocPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  personId: string | null;
  personName: string | null;
};

const TYPE_COLOR: Record<string, string> = {
  target_home: "#ef4444",
  workplace: "#f59e0b",
  hangout: "#6366f1",
  gas_station: "#a78bfa",
  gym: "#10b981",
  school: "#22d3ee",
  snap_check: "#f43f5e",
  safe_zone: "#22c55e",
};

export function MapView({ pins, filter }: { pins: LocPin[]; filter: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="h-[600px] bg-zinc-900/40 border border-zinc-800/60 rounded-lg flex items-center justify-center text-zinc-500 text-sm">
        Loading map...
      </div>
    );

  const filtered =
    filter === "all" ? pins : pins.filter((p) => p.type === filter);
  if (!filtered.length) {
    return (
      <div className="h-[600px] bg-zinc-900/40 border border-zinc-800/60 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-zinc-400">
            No coordinates pinned yet.
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            Add lat/lng to a person's location from their profile page.
          </div>
        </div>
      </div>
    );
  }

  const avgLat = filtered.reduce((s, p) => s + p.lat, 0) / filtered.length;
  const avgLng = filtered.reduce((s, p) => s + p.lng, 0) / filtered.length;

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border border-zinc-800/60">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{
              color: TYPE_COLOR[p.type] || "#71717a",
              fillColor: TYPE_COLOR[p.type] || "#71717a",
              fillOpacity: 0.45,
              weight: 2,
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              opacity={1}
              permanent={false}
            >
              <div className="text-xs font-semibold">{p.name}</div>
              <div className="text-[10px] uppercase opacity-70">
                {p.type.replace(/_/g, " ")}
              </div>
            </Tooltip>
            <Popup>
              <div className="text-xs">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="uppercase tracking-wider mt-0.5 opacity-70">
                  {p.type.replace(/_/g, " ")}
                </div>
                {p.personName && (
                  <a
                    href={`/people/${p.personId}`}
                    className="block mt-1 text-red-600 underline"
                  >
                    Open {p.personName}
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
