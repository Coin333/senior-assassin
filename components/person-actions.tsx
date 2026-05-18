"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select, Textarea, Badge } from "./ui";
import { Save, Trash2, X, Edit2, Pencil } from "lucide-react";

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

export function DeletePersonButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  async function del() {
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    router.push("/targets");
  }
  return (
    <button
      onClick={() => (confirming ? del() : setConfirming(true))}
      onMouseLeave={() => setConfirming(false)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
    >
      <Trash2 className="w-3 h-3" />
      {confirming ? "Confirm delete" : "Delete"}
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
