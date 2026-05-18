"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  Badge,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import {
  Plus,
  X,
  AlertTriangle,
  Eye,
  MessageSquare,
  Trash2,
  Calendar,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

type SusItem = {
  id: string;
  description: string;
  threatLevel: string | null;
  createdAt: Date | null;
};
type RoutineItem = {
  id: string;
  dayOfWeek: number;
  hour: number;
  activity: string;
  predictabilityScore: number | null;
};
type DecItem = {
  id: string;
  platform: string;
  content: string;
  scheduledFor: Date | null;
  posted: boolean | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DefenseShell({
  suspicious,
  routine,
  deception,
}: {
  suspicious: SusItem[];
  routine: RoutineItem[];
  deception: DecItem[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SuspiciousPanel items={suspicious} />
      <DeceptionPanel items={deception} />
      <RoutinePanel items={routine} />
      <RulesCard />
    </div>
  );
}

function SuspiciousPanel({ items }: { items: SusItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", threatLevel: "low" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return;
    await fetch("/api/suspicious", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ description: "", threatLevel: "low" });
    setOpen(false);
    router.refresh();
  }
  async function del(id: string) {
    await fetch(`/api/suspicious?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader
        title="Suspicious Activity Log"
        action={
          <Button size="sm" variant="primary" onClick={() => setOpen(!open)}>
            <Plus className="w-3 h-3" /> Log
          </Button>
        }
      />
      {open && (
        <form
          onSubmit={submit}
          className="p-4 space-y-2 border-b border-zinc-800/60"
        >
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Black sedan parked across the street twice this week..."
          />
          <div className="flex gap-2">
            <Select
              value={form.threatLevel}
              onChange={(e) =>
                setForm({ ...form, threatLevel: e.target.value })
              }
              className="flex-1"
            >
              <option value="low">Low threat</option>
              <option value="medium">Medium threat</option>
              <option value="high">High threat</option>
            </Select>
            <Button type="submit" variant="primary">
              Log
            </Button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Eye className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <div className="text-sm text-zinc-400">All clear.</div>
          <div className="text-xs text-zinc-600 mt-1">
            Nothing suspicious tracked.
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {items.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-start gap-2">
              <AlertTriangle
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.threatLevel === "high" ? "text-red-400" : s.threatLevel === "medium" ? "text-amber-400" : "text-zinc-500"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300">{s.description}</p>
                <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                  {timeAgo(s.createdAt)}
                </p>
              </div>
              <button
                onClick={() => del(s.id)}
                className="p-1 text-zinc-700 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DeceptionPanel({ items }: { items: DecItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    platform: "instagram",
    content: "",
    scheduledFor: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) return;
    await fetch("/api/deception", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scheduledFor: form.scheduledFor || null,
      }),
    });
    setForm({ platform: "instagram", content: "", scheduledFor: "" });
    setOpen(false);
    router.refresh();
  }
  async function togglePosted(id: string, posted: boolean) {
    await fetch("/api/deception", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, posted: !posted }),
    });
    router.refresh();
  }
  async function del(id: string) {
    await fetch(`/api/deception?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader
        title="Deception Layer"
        action={
          <Button size="sm" variant="primary" onClick={() => setOpen(!open)}>
            <Plus className="w-3 h-3" /> Plan Post
          </Button>
        }
      />
      {open && (
        <form
          onSubmit={submit}
          className="p-4 space-y-2 border-b border-zinc-800/60"
        >
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="instagram">Instagram</option>
              <option value="snapchat">Snapchat</option>
              <option value="bereal">BeReal</option>
              <option value="tiktok">TikTok</option>
            </Select>
            <Input
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) =>
                setForm({ ...form, scheduledFor: e.target.value })
              }
            />
          </div>
          <Textarea
            rows={2}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Story: photo of homework at desk, caption 'cooked tonight'"
          />
          <Button type="submit" variant="primary">
            Queue
          </Button>
        </form>
      )}
      {items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <div className="text-sm text-zinc-400">
            No deception posts queued.
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            Plan fake stories that make you look elsewhere.
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {items.map((d) => (
            <div key={d.id} className="px-4 py-3">
              <div className="flex items-start gap-2 mb-1">
                <Badge variant="outline">{d.platform}</Badge>
                {d.scheduledFor && (
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                    {new Date(d.scheduledFor).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 mb-2">{d.content}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePosted(d.id, !!d.posted)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border cursor-pointer ${d.posted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}
                >
                  {d.posted ? "posted" : "queued"}
                </button>
                <button
                  onClick={() => del(d.id)}
                  className="ml-auto p-1 text-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RoutinePanel({ items }: { items: RoutineItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function saveCell(day: number, hour: number) {
    if (!text.trim()) {
      setEditing(null);
      return;
    }
    await fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: day, hour, activity: text }),
    });
    setEditing(null);
    setText("");
    router.refresh();
  }
  async function delEntry(id: string) {
    await fetch(`/api/routine?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  function entryFor(day: number, hour: number) {
    return items.find((i) => i.dayOfWeek === day && i.hour === hour);
  }

  const predictability =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce((s, i) => s + (i.predictabilityScore || 5), 0) /
            items.length,
        );
  const hours = [7, 8, 9, 10, 12, 14, 16, 18, 20, 22];

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Your Routine Audit"
        action={
          <span className="text-[10px] font-mono text-zinc-500">
            PREDICTABILITY:{" "}
            <span
              className={
                predictability >= 7
                  ? "text-red-400"
                  : predictability >= 4
                    ? "text-amber-400"
                    : "text-emerald-400"
              }
            >
              {predictability}/10
            </span>
          </span>
        }
      />
      <div className="overflow-x-auto">
        <div className="min-w-[640px] p-3">
          <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-px bg-zinc-800/40 border border-zinc-800/60 rounded-md overflow-hidden">
            <div className="bg-zinc-950 p-1.5" />
            {DAYS.map((d, i) => (
              <div
                key={i}
                className="bg-zinc-950 p-1.5 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
            {hours.map((h) => (
              <div key={h} className="contents">
                <div className="bg-zinc-950 p-1.5 text-right text-[10px] font-mono text-zinc-500">
                  {h}
                </div>
                {DAYS.map((_, di) => {
                  const entry = entryFor(di, h);
                  const key = `${di}-${h}`;
                  if (editing === key) {
                    return (
                      <input
                        key={key}
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={() => saveCell(di, h)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCell(di, h);
                          if (e.key === "Escape") {
                            setEditing(null);
                            setText("");
                          }
                        }}
                        className="bg-emerald-500/10 px-1 py-0.5 text-[10px] text-zinc-100 outline-none w-full border-0"
                      />
                    );
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setEditing(key);
                        setText(entry?.activity || "");
                      }}
                      onDoubleClick={() => entry && delEntry(entry.id)}
                      className={`p-1 text-left text-[10px] truncate min-h-[24px] transition-colors ${entry ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" : "bg-zinc-950 hover:bg-zinc-900/60 text-zinc-700"}`}
                    >
                      {entry?.activity || ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 font-mono">
            CLICK CELL TO EDIT, DOUBLE-CLICK TO DELETE. FILL IN YOUR REGULAR
            PATTERN, THEN VARY IT.
          </p>
        </div>
      </div>
    </Card>
  );
}

function RulesCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Defense Doctrine" />
      <ul className="p-4 space-y-2 text-xs text-zinc-300">
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">01</span> Vary your routine.
          Different exit times, different gas stations, different routes.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">02</span> Check the backseat
          before driving. Yes, really.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">03</span> Park in well-lit,
          well-trafficked spots. Avoid the back corner of any lot.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">04</span> Don't be alone in
          your driveway after dark in top 10.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">05</span> Run a deception
          layer. Post stories that suggest you're elsewhere.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">06</span> Trust no friendly
          approach in late game. "Yo wait" is a stall.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">07</span> Check under wipers
          before approaching your car. Notes are bait.
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-600 font-mono">08</span> If you sense
          surveillance, abort. Go inside. Try again later.
        </li>
      </ul>
    </Card>
  );
}
