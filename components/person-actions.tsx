"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select, Textarea, Badge } from "./ui";
import { Save, Trash2, X, Edit2, Pencil, Skull, Heart } from "lucide-react";

export function StatusButtons({
  id,
  status,
}: {
  id: string;
  status: string | null;
}) {
  const router = useRouter();
  async function setStatus(s: string) {
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-1.5">
      <Button
        size="sm"
        variant={status === "alive" ? "primary" : "outline"}
        onClick={() => setStatus("alive")}
      >
        Alive
      </Button>
      <Button
        size="sm"
        variant={status === "eliminated_me" ? "primary" : "outline"}
        onClick={() => setStatus("eliminated_me")}
      >
        Killed
      </Button>
      <Button
        size="sm"
        variant={status === "eliminated" ? "primary" : "outline"}
        onClick={() => setStatus("eliminated")}
      >
        Out
      </Button>
    </div>
  );
}

/**
 * Quick toggle for the targets list cards. One tap to confirm a kill.
 * If the target is alive, shows a "Mark Killed" CTA. If already killed,
 * shows a "Revive" outline that flips back to alive.
 */
export function QuickKillToggle({
  id,
  status,
}: {
  id: string;
  status: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(s: string) {
    setBusy(true);
    try {
      await fetch(`/api/people/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "eliminated_me") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          set("alive");
        }}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer disabled:opacity-60"
      >
        <Heart className="w-3 h-3" /> Revive
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Confirm kill? This updates dashboard stats.")) return;
        set("eliminated_me");
      }}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25 cursor-pointer disabled:opacity-60"
    >
      <Skull className="w-3 h-3" /> Killed
    </button>
  );
}

export function ThreatToggle({
  id,
  level,
}: {
  id: string;
  level: string | null;
}) {
  const router = useRouter();
  async function setLevel(l: string) {
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threatLevel: l }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-1.5">
      {(["low", "medium", "high"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLevel(l)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
            level === l
              ? l === "high"
                ? "bg-red-500/15 border-red-500/40 text-red-300"
                : l === "medium"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function AddNoteForm({
  personId,
  allPeople,
}: {
  personId: string;
  allPeople: { id: string; name: string }[];
}) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, content, source: source || null }),
    });
    setContent("");
    setSource("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="p-4 space-y-2 border-t border-zinc-800/60"
    >
      <Textarea
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Log intel: target left house at 6:42pm, drove east..."
      />
      <div className="flex gap-2">
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="flex-1"
        >
          <option value="">No source (direct observation)</option>
          {allPeople.map((p) => (
            <option key={p.id} value={p.name}>
              via {p.name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Logging..." : "Log Intel"}
        </Button>
      </div>
    </form>
  );
}

export function AddLocationForm({ personId }: { personId: string }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("snap_check");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        address: address || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        personId,
      }),
    });
    setName("");
    setAddress("");
    setLat("");
    setLng("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="p-4 space-y-2 border-t border-zinc-800/60"
    >
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Wawa on 3rd)"
          required
        />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="snap_check">Snap Map Check</option>
          <option value="target_home">Home</option>
          <option value="workplace">Workplace</option>
          <option value="hangout">Hangout</option>
          <option value="gas_station">Gas Station</option>
          <option value="gym">Gym</option>
          <option value="school">School</option>
        </Select>
      </div>
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address (optional)"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Lat (e.g. 40.7128)"
        />
        <Input
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Lng (e.g. -74.006)"
        />
      </div>
      <Button type="submit" disabled={loading || !name}>
        {loading ? "Pinning..." : "Pin Location"}
      </Button>
    </form>
  );
}

export function PersonFieldEditor({
  id,
  field,
  value,
  label,
  placeholder,
}: {
  id: string;
  field: string;
  value: string | null;
  label: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val || null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex gap-1">
        <Textarea
          rows={2}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
        />
        <div className="flex flex-col gap-1">
          <button
            onClick={save}
            disabled={saving}
            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-400"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setVal(value || "");
            }}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left w-full group">
      <div className="text-xs text-zinc-300 flex items-start gap-1.5">
        <span className="flex-1">
          {value || (
            <span className="text-zinc-600 italic">
              click to add {label.toLowerCase()}
            </span>
          )}
        </span>
        <Pencil className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 mt-0.5" />
      </div>
    </button>
  );
}

type SocialField = {
  key:
    | "snapchatHandle"
    | "instagramHandle"
    | "tiktokHandle"
    | "beRealHandle"
    | "stravaHandle"
    | "spotifyHandle"
    | "venmoHandle";
  label: string;
  href?: (handle: string) => string;
};

const SOCIAL_FIELDS: SocialField[] = [
  {
    key: "snapchatHandle",
    label: "Snapchat",
    href: (h) => `https://snapchat.com/add/${h.replace(/^@/, "")}`,
  },
  {
    key: "instagramHandle",
    label: "Instagram",
    href: (h) => `https://instagram.com/${h.replace(/^@/, "")}`,
  },
  {
    key: "tiktokHandle",
    label: "TikTok",
    href: (h) => `https://tiktok.com/@${h.replace(/^@/, "")}`,
  },
  { key: "beRealHandle", label: "BeReal" },
  {
    key: "stravaHandle",
    label: "Strava",
    href: (h) => `https://strava.com/athletes/${h}`,
  },
  { key: "spotifyHandle", label: "Spotify" },
  {
    key: "venmoHandle",
    label: "Venmo",
    href: (h) => `https://venmo.com/u/${h.replace(/^@/, "")}`,
  },
];

export function SocialMediaEditor({
  id,
  values,
}: {
  id: string;
  values: Partial<Record<SocialField["key"], string | null>>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const f of SOCIAL_FIELDS) out[f.key] = values[f.key] || "";
    return out;
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload: Record<string, string | null> = {};
    for (const f of SOCIAL_FIELDS) {
      const next = draft[f.key].trim();
      payload[f.key] = next ? next : null;
    }
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="p-4 space-y-2">
        {SOCIAL_FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 w-20">
              {f.label}
            </span>
            <Input
              value={draft[f.key]}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [f.key]: e.target.value }))
              }
              placeholder="@handle"
              className="flex-1 text-xs"
            />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              const reset: Record<string, string> = {};
              for (const f of SOCIAL_FIELDS) reset[f.key] = values[f.key] || "";
              setDraft(reset);
            }}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1.5">
      {SOCIAL_FIELDS.map((f) => {
        const handle = values[f.key];
        return (
          <div key={f.key} className="flex items-center gap-2.5 py-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 w-20">
              {f.label}
            </span>
            {handle ? (
              f.href ? (
                <a
                  href={f.href(handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-200 hover:text-red-300 truncate flex-1"
                >
                  {handle}
                </a>
              ) : (
                <span className="text-xs text-zinc-200 truncate flex-1">
                  {handle}
                </span>
              )
            ) : (
              <span className="text-xs text-zinc-600 italic flex-1">
                not tracked
              </span>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-red-400 cursor-pointer"
      >
        <Pencil className="w-3 h-3" /> Edit handles
      </button>
    </div>
  );
}

export function AllegianceEditor({
  id,
  side,
  role,
  associatedTargetId,
  relationshipToTarget,
  targets,
}: {
  id: string;
  side: string | null;
  role: string | null;
  associatedTargetId: string | null;
  relationshipToTarget: string | null;
  targets: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    side: side ?? "neutral",
    role: role ?? "neutral",
    associatedTargetId: associatedTargetId ?? "",
    relationshipToTarget: relationshipToTarget ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/people/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        side: draft.side,
        role: draft.role,
        associatedTargetId: draft.associatedTargetId || null,
        relationshipToTarget: draft.relationshipToTarget || null,
      }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  const sideLabel =
    side === "mine"
      ? "Your team"
      : side === "target"
        ? "Target's side"
        : "Neutral";
  const sideColor =
    side === "mine"
      ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
      : side === "target"
        ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
        : "bg-zinc-800 text-zinc-400 border-zinc-700";

  if (!editing) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${sideColor}`}
          >
            {sideLabel}
          </span>
          <Badge variant="outline">{role}</Badge>
        </div>
        {associatedTargetId && (
          <div className="text-xs text-zinc-400">
            Linked to{" "}
            <span className="text-zinc-100 font-medium">
              {targets.find((t) => t.id === associatedTargetId)?.name ??
                "unknown"}
            </span>
            {relationshipToTarget && (
              <span className="text-zinc-500"> as {relationshipToTarget}</span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-red-400 cursor-pointer"
        >
          <Pencil className="w-3 h-3" /> Edit allegiance
        </button>
      </div>
    );
  }

  const isTargetRole = draft.role === "target";

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Role</Label>
          <Select
            value={draft.role}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                role: e.target.value,
                side:
                  e.target.value === "target"
                    ? "target"
                    : e.target.value === "ally"
                      ? "mine"
                      : d.side,
              }))
            }
          >
            <option value="target">Target</option>
            <option value="ally">Ally</option>
            <option value="friend">Friend</option>
            <option value="family">Family</option>
            <option value="romantic">Romantic</option>
            <option value="coworker">Coworker</option>
            <option value="teammate">Teammate</option>
            <option value="neutral">Neutral</option>
          </Select>
        </div>
        <div>
          <Label>Side</Label>
          <Select
            value={draft.side}
            onChange={(e) => setDraft((d) => ({ ...d, side: e.target.value }))}
            disabled={isTargetRole}
          >
            <option value="mine">My side</option>
            <option value="target">Target&apos;s side</option>
            <option value="neutral">Neutral</option>
          </Select>
        </div>
      </div>
      {!isTargetRole && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Linked target</Label>
            <Select
              value={draft.associatedTargetId}
              onChange={(e) =>
                setDraft((d) => ({ ...d, associatedTargetId: e.target.value }))
              }
            >
              <option value="">None</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Relationship</Label>
            <Select
              value={draft.relationshipToTarget}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  relationshipToTarget: e.target.value,
                }))
              }
              disabled={!draft.associatedTargetId}
            >
              <option value="">Pick relationship</option>
              <option value="friend">Friend</option>
              <option value="best_friend">Best friend</option>
              <option value="family">Family</option>
              <option value="romantic">Romantic interest</option>
              <option value="coworker">Coworker</option>
              <option value="teammate">Teammate</option>
              <option value="sibling">Sibling</option>
              <option value="parent">Parent</option>
              <option value="other">Other</option>
            </Select>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setDraft({
              side: side ?? "neutral",
              role: role ?? "neutral",
              associatedTargetId: associatedTargetId ?? "",
              relationshipToTarget: relationshipToTarget ?? "",
            });
          }}
        >
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function ScheduleGrid({
  personId,
  schedule,
}: {
  personId: string;
  schedule: any[];
}) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [text, setText] = useState("");
  const router = useRouter();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = [
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  function entryFor(day: number, hour: number) {
    return schedule.find((s: any) => s.dayOfWeek === day && s.hour === hour);
  }

  async function saveCell(day: number, hour: number) {
    if (text.trim()) {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          dayOfWeek: day,
          hour,
          activity: text,
        }),
      });
    }
    setEditingCell(null);
    setText("");
    router.refresh();
  }

  async function deleteCell(id: string) {
    await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] p-3">
        <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-px bg-zinc-800/40 border border-zinc-800/60 rounded-md overflow-hidden">
          <div className="bg-zinc-950 p-1.5" />
          {days.map((d, i) => (
            <div
              key={i}
              className="bg-zinc-950 p-1.5 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
          {hours.map((h) => (
            <div key={`row-${h}`} className="contents">
              <div className="bg-zinc-950 p-1.5 text-right text-[10px] font-mono text-zinc-500">
                {h}
              </div>
              {days.map((_, di) => {
                const entry = entryFor(di, h);
                const cellKey = `${di}-${h}`;
                if (editingCell === cellKey) {
                  return (
                    <input
                      key={cellKey}
                      autoFocus
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onBlur={() => saveCell(di, h)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCell(di, h);
                        if (e.key === "Escape") {
                          setEditingCell(null);
                          setText("");
                        }
                      }}
                      className="bg-red-500/10 border-0 px-1 py-0.5 text-[10px] text-zinc-100 outline-none w-full"
                    />
                  );
                }
                return (
                  <button
                    key={cellKey}
                    onClick={() => {
                      setEditingCell(cellKey);
                      setText(entry?.activity || "");
                    }}
                    onDoubleClick={() => entry && deleteCell(entry.id)}
                    className={`p-1 text-left text-[10px] truncate min-h-[24px] transition-colors ${entry ? "bg-red-500/10 text-red-300 hover:bg-red-500/20" : "bg-zinc-950 hover:bg-zinc-900/60 text-zinc-700"}`}
                  >
                    {entry?.activity || ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 font-mono">
          CLICK TO EDIT, DOUBLE-CLICK TO DELETE
        </p>
      </div>
    </div>
  );
}

export function DeletePersonButton({
  id,
  name,
}: {
  id: string;
  name?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    const label = name ? `"${name}"` : "this person";
    if (
      !confirm(
        `Delete ${label}? This removes them and all their notes, locations, schedule, photos, and relationships. This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/people/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.text();
        alert(`Delete failed: ${body || res.statusText}`);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
    >
      <Trash2 className="w-3 h-3" />
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}

export function AddRelationshipForm({
  personId,
  candidates,
}: {
  personId: string;
  candidates: { id: string; name: string }[];
}) {
  const [toId, setToId] = useState("");
  const [type, setType] = useState("friend");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!toId) return;
    await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPersonId: personId, toPersonId: toId, type }),
    });
    setToId("");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="p-4 space-y-2 border-t border-zinc-800/60"
    >
      <div className="grid grid-cols-2 gap-2">
        <Select value={toId} onChange={(e) => setToId(e.target.value)}>
          <option value="">Select person...</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="friend">Friend</option>
          <option value="romantic">Romantic</option>
          <option value="family">Family</option>
          <option value="coworker">Coworker</option>
          <option value="teammate">Teammate</option>
          <option value="rival">Rival</option>
        </Select>
      </div>
      <Button type="submit" disabled={!toId}>
        Link Connection
      </Button>
    </form>
  );
}
