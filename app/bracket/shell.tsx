"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
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
import { Plus, X, Trophy, Trash2 } from "lucide-react";
import { timeAgo, statusLabel } from "@/lib/utils";

type Round = {
  id: string;
  weekNumber: number;
  targetId: string | null;
  outcome: string | null;
  method: string | null;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
};

type T = {
  id: string;
  name: string;
  photoUrl: string | null;
  status: string | null;
  threatLevel: string | null;
  weekAssigned: number | null;
};

export function BracketShell({
  rounds,
  targets,
}: {
  rounds: Round[];
  targets: T[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const tMap = new Map(targets.map((t) => [t.id, t]));

  async function del(id: string) {
    if (!confirm("Delete this round entry?")) return;
    await fetch(`/api/rounds?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <Card>
          <CardHeader
            title="Round History"
            action={
              <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
                <Plus className="w-3 h-3" /> Log Round
              </Button>
            }
          />
          {rounds.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Trophy className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <div className="text-sm text-zinc-400">No rounds logged.</div>
              <div className="text-xs text-zinc-600 mt-1">
                Add your first week's assignment to track progress.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {rounds.map((r) => {
                const t = r.targetId ? tMap.get(r.targetId) : null;
                return (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-red-400">
                        {r.weekNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        {t ? (
                          <Link
                            href={`/people/${t.id}`}
                            className="flex items-center gap-2 group"
                          >
                            <Avatar
                              name={t.name}
                              src={t.photoUrl}
                              size={28}
                              status={t.status}
                            />
                            <div>
                              <div className="text-sm font-semibold text-zinc-100 group-hover:text-red-300">
                                {t.name}
                              </div>
                              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                {r.method || "method unset"}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="text-xs text-zinc-500">
                            No target linked
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            r.outcome === "kill"
                              ? "emerald"
                              : r.outcome === "died"
                                ? "red"
                                : r.outcome === "survived"
                                  ? "amber"
                                  : "default"
                          }
                        >
                          {r.outcome || "pending"}
                        </Badge>
                        <button
                          onClick={() => del(r.id)}
                          className="p-1 rounded text-zinc-700 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {r.notes && (
                      <p className="text-xs text-zinc-400 mt-2 pl-15 ml-15 border-l-2 border-zinc-800 pl-2 ml-15">
                        {r.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Leaderboard (My Targets)" />
          <div className="divide-y divide-zinc-800/60">
            {targets.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No data yet.
              </div>
            ) : (
              [...targets]
                .sort((a, b) => {
                  const o = (s: string | null) =>
                    s === "eliminated_me" ? 0 : s === "alive" ? 1 : 2;
                  return o(a.status) - o(b.status);
                })
                .map((t, i) => (
                  <Link
                    key={t.id}
                    href={`/people/${t.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 group"
                  >
                    <div className="w-5 text-[10px] font-mono text-zinc-600">
                      {(i + 1).toString().padStart(2, "0")}
                    </div>
                    <Avatar
                      name={t.name}
                      src={t.photoUrl}
                      size={28}
                      status={t.status}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-red-300 truncate">
                        {t.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {statusLabel(t.status)}{" "}
                        {t.weekAssigned ? `· w${t.weekAssigned}` : ""}
                      </div>
                    </div>
                    {t.status === "eliminated_me" && (
                      <Badge variant="emerald">KO</Badge>
                    )}
                    {t.status === "alive" && <Badge variant="red">LIVE</Badge>}
                  </Link>
                ))
            )}
          </div>
        </Card>
      </div>

      {open && <RoundModal targets={targets} onClose={() => setOpen(false)} />}
    </div>
  );
}

function RoundModal({
  targets,
  onClose,
}: {
  targets: T[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    weekNumber: "1",
    targetId: "",
    outcome: "pending",
    method: "",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber: parseInt(form.weekNumber, 10),
        targetId: form.targetId || null,
        outcome: form.outcome,
        method: form.method || null,
        notes: form.notes || null,
        startDate: new Date(),
      }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:pl-[17rem]">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500">
              ROUND LOG
            </div>
            <h2 className="text-base font-semibold text-zinc-100">
              New Round Entry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Week</Label>
              <Input
                type="number"
                value={form.weekNumber}
                onChange={(e) =>
                  setForm({ ...form, weekNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Outcome</Label>
              <Select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="kill">Kill (I got them)</option>
                <option value="died">Died (they got me)</option>
                <option value="survived">Survived (timed out)</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Target</Label>
            <Select
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            >
              <option value="">No target linked</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Method</Label>
            <Input
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              placeholder="DoorDash bait + curb bump"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What went down."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Log Round"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
