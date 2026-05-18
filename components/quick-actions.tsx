"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Skull,
  AlertTriangle,
  PenSquare,
  MapPin,
  X,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "./ui";

type Target = { id: string; name: string };

type Panel = "kill" | "intel" | "threat" | "snap" | null;

export function HomeQuickActions({
  targets,
  recentTargets,
}: {
  targets: Target[];
  recentTargets: Target[];
}) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ActionTile
          icon={Skull}
          label="Log Kill"
          tone="red"
          active={panel === "kill"}
          onClick={() => setPanel(panel === "kill" ? null : "kill")}
        />
        <ActionTile
          icon={PenSquare}
          label="Log Intel"
          tone="indigo"
          active={panel === "intel"}
          onClick={() => setPanel(panel === "intel" ? null : "intel")}
        />
        <ActionTile
          icon={MapPin}
          label="Snap Check"
          tone="amber"
          active={panel === "snap"}
          onClick={() => setPanel(panel === "snap" ? null : "snap")}
        />
        <ActionTile
          icon={AlertTriangle}
          label="Log Threat"
          tone="orange"
          active={panel === "threat"}
          onClick={() => setPanel(panel === "threat" ? null : "threat")}
        />
      </div>

      {panel === "kill" && (
        <KillPanel
          targets={recentTargets}
          onDone={() => setPanel(null)}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "intel" && (
        <IntelPanel
          targets={targets}
          onDone={() => setPanel(null)}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "snap" && (
        <SnapPanel
          targets={targets}
          onDone={() => setPanel(null)}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "threat" && (
        <ThreatPanel
          onDone={() => setPanel(null)}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  tone,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "red" | "indigo" | "amber" | "orange";
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    red: active
      ? "bg-red-500/15 border-red-500/50 text-red-300"
      : "border-zinc-800 text-zinc-300 hover:border-red-500/40 hover:bg-red-500/5",
    indigo: active
      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
      : "border-zinc-800 text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-500/5",
    amber: active
      ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
      : "border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/5",
    orange: active
      ? "bg-orange-500/15 border-orange-500/50 text-orange-300"
      : "border-zinc-800 text-zinc-300 hover:border-orange-500/40 hover:bg-orange-500/5",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${tones[tone]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-mono uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-red-400/80">
          {title}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function KillPanel({
  targets,
  onDone,
  onClose,
}: {
  targets: Target[];
  onDone: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function kill(id: string) {
    setBusy(id);
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "eliminated_me" }),
    });
    setBusy(null);
    setDone(id);
    router.refresh();
    setTimeout(() => onDone(), 800);
  }

  if (targets.length === 0) {
    return (
      <PanelShell title="Log a kill" onClose={onClose}>
        <p className="text-xs text-zinc-500">
          No live targets right now. Add one from the Targets page.
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Log a kill" onClose={onClose}>
      <p className="text-xs text-zinc-400">
        Tap a target to mark them eliminated. Dashboard stats update instantly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {targets.map((t) => (
          <button
            type="button"
            key={t.id}
            disabled={busy === t.id || done === t.id}
            onClick={() => kill(t.id)}
            className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-zinc-800 hover:border-red-500/40 hover:bg-red-500/5 cursor-pointer disabled:opacity-50"
          >
            <span className="text-sm text-zinc-100 truncate">{t.name}</span>
            {done === t.id ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Skull className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            )}
          </button>
        ))}
      </div>
    </PanelShell>
  );
}

function IntelPanel({
  targets,
  onDone,
  onClose,
}: {
  targets: Target[];
  onDone: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [personId, setPersonId] = useState(targets[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: personId || null,
        content: content.trim(),
        source: source.trim() || null,
      }),
    });
    setBusy(false);
    setContent("");
    setSource("");
    router.refresh();
    onDone();
  }

  return (
    <PanelShell title="Log intel" onClose={onClose}>
      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label>About (optional)</Label>
            <Select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">General intel</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Source (optional)</Label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Mutual, sibling, etc."
            />
          </div>
        </div>
        <div>
          <Label>What you heard</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Working closing shift Thursday..."
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={busy || !content.trim()}>
            <Send className="w-3.5 h-3.5" /> {busy ? "Saving" : "Log Intel"}
          </Button>
        </div>
      </form>
    </PanelShell>
  );
}

function SnapPanel({
  targets,
  onDone,
  onClose,
}: {
  targets: Target[];
  onDone: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [personId, setPersonId] = useState(targets[0]?.id ?? "");
  const [where, setWhere] = useState("");
  const [coords, setCoords] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId || !where.trim()) return;
    setBusy(true);
    const target = targets.find((t) => t.id === personId);
    const [latStr, lngStr] = coords.split(",").map((s) => s.trim());
    const lat = latStr ? Number(latStr) : null;
    const lng = lngStr ? Number(lngStr) : null;
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${target?.name ?? "Target"} - ${where.trim()}`,
        type: "snap_check",
        personId,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        observedAt: new Date().toISOString(),
      }),
    });
    setBusy(false);
    setWhere("");
    setCoords("");
    router.refresh();
    onDone();
  }

  if (targets.length === 0) {
    return (
      <PanelShell title="Log a Snap Map check" onClose={onClose}>
        <p className="text-xs text-zinc-500">Add a target first.</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Log a Snap Map check" onClose={onClose}>
      <form onSubmit={submit} className="space-y-2">
        <div>
          <Label>Target</Label>
          <Select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label>Where</Label>
            <Input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Chick-fil-A on 5th"
            />
          </div>
          <div>
            <Label>Lat, Lng (optional)</Label>
            <Input
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              placeholder="40.7128, -74.006"
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={busy || !where.trim() || !personId}
          >
            <MapPin className="w-3.5 h-3.5" />{" "}
            {busy ? "Saving" : "Pin Sighting"}
          </Button>
        </div>
      </form>
    </PanelShell>
  );
}

function ThreatPanel({
  onDone,
  onClose,
}: {
  onDone: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("low");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setBusy(true);
    await fetch("/api/suspicious", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description.trim(),
        threatLevel: level,
      }),
    });
    setBusy(false);
    setDescription("");
    router.refresh();
    onDone();
  }

  return (
    <PanelShell title="Log a threat" onClose={onClose}>
      <form onSubmit={submit} className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Black sedan parked across the street twice today..."
          rows={2}
        />
        <div className="flex items-center gap-2">
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="flex-1"
          >
            <option value="low">Low threat</option>
            <option value="medium">Medium threat</option>
            <option value="high">High threat</option>
          </Select>
          <Button
            type="submit"
            size="sm"
            disabled={busy || !description.trim()}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {busy ? "Saving" : "Log"}
          </Button>
        </div>
      </form>
    </PanelShell>
  );
}
