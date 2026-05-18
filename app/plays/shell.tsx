"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PLAYBOOK, STALLS, EQUIPMENT_DEFAULTS, timeAgo } from "@/lib/utils";
import {
  Plus,
  X,
  Swords,
  BookOpen,
  Wrench,
  Pause,
  Save,
  Trash2,
} from "lucide-react";

type Op = {
  id: string;
  playType: string;
  status: string;
  targetId: string;
  targetName: string;
  timeWindow: string | null;
  primaryBait: string | null;
  backupBait: string | null;
  approach: string | null;
  exit: string | null;
  abortCriteria: string | null;
  parentsStatus: string | null;
  knownAllies: string | null;
  notes: string | null;
  equipment: string | null;
  shooterPersonId: string | null;
  driverPersonId: string | null;
  createdAt: Date | null;
  plannedFor: Date | null;
  result: string | null;
};

type Target = {
  id: string;
  name: string;
  status: string | null;
  photoUrl: string | null;
  threatLevel: string | null;
  address: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehiclePlate: string | null;
  workplace: string | null;
};

const TABS = [
  { value: "ops", label: "Operations", icon: Swords },
  { value: "playbook", label: "Playbook", icon: BookOpen },
  { value: "stalls", label: "Stalls", icon: Pause },
  { value: "equipment", label: "Equipment", icon: Wrench },
];

export function PlayShell({
  ops,
  targets,
  assets,
  equipment,
}: {
  ops: Op[];
  targets: Target[];
  assets: { id: string; name: string }[];
  equipment: any[];
}) {
  const search = useSearchParams();
  const initialTab = search?.get("op") ? "ops" : "ops";
  const [tab, setTab] = useState(initialTab);
  const [opModal, setOpModal] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm transition-all border whitespace-nowrap cursor-pointer ${
                  tab === t.value
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
        {tab === "ops" && (
          <Button variant="primary" onClick={() => setOpModal(true)}>
            <Plus className="w-3.5 h-3.5" /> New Operation
          </Button>
        )}
      </div>

      {tab === "ops" && <OpsList ops={ops} targets={targets} assets={assets} />}
      {tab === "playbook" && (
        <Playbook
          onCreate={(playType) => {
            setOpModal(true); /* could pass play type */
          }}
        />
      )}
      {tab === "stalls" && <StallLibrary />}
      {tab === "equipment" && <EquipmentChecklist items={equipment} />}

      {opModal && (
        <NewOpModal
          targets={targets}
          assets={assets}
          onClose={() => setOpModal(false)}
        />
      )}
    </div>
  );
}

function OpsList({
  ops,
  targets,
  assets,
}: {
  ops: Op[];
  targets: Target[];
  assets: { id: string; name: string }[];
}) {
  if (!ops.length) {
    return (
      <Card className="px-6 py-12 text-center">
        <Swords className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <div className="text-sm text-zinc-400">No operations yet.</div>
        <div className="text-xs text-zinc-600 mt-1">
          Pick a play from the Playbook tab or start one above.
        </div>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ops.map((o) => (
        <OpCard key={o.id} op={o} targets={targets} assets={assets} />
      ))}
    </div>
  );
}

function OpCard({
  op,
  targets,
  assets,
}: {
  op: Op;
  targets: Target[];
  assets: { id: string; name: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const target = targets.find((t) => t.id === op.targetId);
  const shooter = assets.find((a) => a.id === op.shooterPersonId);
  const driver = assets.find((a) => a.id === op.driverPersonId);

  async function setStatus(status: string) {
    await fetch(`/api/operations/${op.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        executedAt:
          status === "successful" || status === "failed"
            ? new Date()
            : undefined,
      }),
    });
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this operation?")) return;
    await fetch(`/api/operations/${op.id}`, { method: "DELETE" });
    router.refresh();
  }

  const statusColor =
    op.status === "successful"
      ? "emerald"
      : op.status === "active"
        ? "red"
        : op.status === "aborted" || op.status === "failed"
          ? "default"
          : "amber";

  return (
    <Card>
      <CardHeader
        title={op.playType.replace(/_/g, " ")}
        action={<Badge variant={statusColor as any}>{op.status}</Badge>}
      />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={target?.name || "?"}
            src={target?.photoUrl}
            size={36}
            status={target?.status}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-zinc-100 truncate">
              vs {op.targetName}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              {op.timeWindow || "No time set"}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="space-y-2 text-xs pt-2 border-t border-zinc-800/60">
            {op.primaryBait && (
              <BriefRow label="Primary Bait" value={op.primaryBait} />
            )}
            {op.backupBait && (
              <BriefRow label="Backup Bait" value={op.backupBait} />
            )}
            {op.approach && <BriefRow label="Approach" value={op.approach} />}
            {op.exit && <BriefRow label="Exit" value={op.exit} />}
            {op.parentsStatus && (
              <BriefRow label="Parents" value={op.parentsStatus} />
            )}
            {op.knownAllies && (
              <BriefRow label="Allies" value={op.knownAllies} />
            )}
            {op.abortCriteria && (
              <BriefRow label="Abort" value={op.abortCriteria} />
            )}
            {shooter && <BriefRow label="Shooter" value={shooter.name} />}
            {driver && <BriefRow label="Driver" value={driver.name} />}
            {op.notes && <BriefRow label="Notes" value={op.notes} />}
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/60">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-200 px-2 py-1"
          >
            {expanded ? "COLLAPSE" : "BRIEF"}
          </button>
          <div className="flex-1" />
          {op.status === "planning" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus("active")}
            >
              Go Live
            </Button>
          )}
          {op.status === "active" && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setStatus("successful")}
              >
                Hit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatus("aborted")}
              >
                Abort
              </Button>
            </>
          )}
          {(op.status === "planning" || op.status === "aborted") && (
            <button
              onClick={del}
              className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 w-16 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-xs text-zinc-300 flex-1">{value}</span>
    </div>
  );
}

function Playbook({ onCreate }: { onCreate: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PLAYBOOK.map((p) => (
        <Card
          key={p.id}
          className="p-4 hover:border-red-500/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-zinc-100">{p.name}</h3>
            <Badge variant={p.parentsHome ? "emerald" : "red"}>
              {p.parentsHome ? "parents OK" : "parents away"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{p.summary}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => onCreate(p.id)}
          >
            <Plus className="w-3 h-3" /> Build Op
          </Button>
        </Card>
      ))}
    </div>
  );
}

function StallLibrary() {
  const grouped = STALLS.reduce<Record<string, typeof STALLS>>((acc, s) => {
    if (!acc[s.situation]) acc[s.situation] = [];
    acc[s.situation].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([situation, list]) => (
        <Card key={situation}>
          <CardHeader
            title={situation.replace(/_/g, " ")}
            action={
              <span className="text-[10px] font-mono text-zinc-500">
                {list.length} STALLS
              </span>
            }
          />
          <div className="divide-y divide-zinc-800/60">
            {list.map((s) => (
              <div
                key={s.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="text-sm text-zinc-200">{s.label}</div>
                <Badge variant="outline">{s.duration}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EquipmentChecklist({ items }: { items: any[] }) {
  const router = useRouter();
  const [newItem, setNewItem] = useState("");

  async function ensureDefaults() {
    if (items.length > 0) return;
    for (const item of EQUIPMENT_DEFAULTS) {
      await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    router.refresh();
  }

  async function toggle(id: string, owned: boolean) {
    await fetch("/api/equipment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, owned: !owned }),
    });
    router.refresh();
  }

  async function add() {
    if (!newItem.trim()) return;
    await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItem }),
    });
    setNewItem("");
    router.refresh();
  }

  async function del(id: string) {
    await fetch(`/api/equipment?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <Card className="px-6 py-12 text-center">
        <Wrench className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <div className="text-sm text-zinc-400 mb-4">
          Empty kit. Load the default equipment list to get started.
        </div>
        <Button variant="primary" onClick={ensureDefaults}>
          Load Default Kit
        </Button>
      </Card>
    );
  }

  const grouped = items.reduce<Record<string, any[]>>((acc, i) => {
    const cat = i.category || "misc";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(i);
    return acc;
  }, {});

  const owned = items.filter((i) => i.owned).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Kit Status"
          action={
            <span className="text-[10px] font-mono text-zinc-500">
              {owned} / {items.length} OWNED
            </span>
          }
        />
        <div className="px-4 py-3 border-b border-zinc-800/60 flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add custom equipment..."
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add} disabled={!newItem.trim()}>
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </Card>
      {Object.entries(grouped).map(([cat, list]) => (
        <Card key={cat}>
          <CardHeader title={cat} />
          <div className="divide-y divide-zinc-800/60">
            {list.map((i) => (
              <div key={i.id} className="px-4 py-2.5 flex items-center gap-3">
                <button
                  onClick={() => toggle(i.id, i.owned)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${i.owned ? "bg-emerald-500/20 border-emerald-500" : "border-zinc-700 hover:border-zinc-500"}`}
                >
                  {i.owned && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-sm" />
                  )}
                </button>
                <span
                  className={`text-sm flex-1 ${i.owned ? "text-zinc-200" : "text-zinc-500"}`}
                >
                  {i.name}
                </span>
                <button
                  onClick={() => del(i.id)}
                  className="p-1 rounded text-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function NewOpModal({
  targets,
  assets,
  onClose,
}: {
  targets: Target[];
  assets: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    targetId: targets[0]?.id || "",
    playType: PLAYBOOK[0].id,
    timeWindow: "",
    primaryBait: "",
    backupBait: "",
    approach: "",
    exit: "",
    parentsStatus: "unknown",
    knownAllies: "",
    abortCriteria: "",
    shooterPersonId: "",
    driverPersonId: "",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.targetId) return;
    setLoading(true);
    await fetch("/api/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        shooterPersonId: form.shooterPersonId || null,
        driverPersonId: form.driverPersonId || null,
      }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500">
              KILL BRIEF
            </div>
            <h2 className="text-base font-semibold text-zinc-100">
              New Operation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target</Label>
              <Select
                value={form.targetId}
                onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                required
              >
                <option value="">Select target...</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Play</Label>
              <Select
                value={form.playType}
                onChange={(e) => setForm({ ...form, playType: e.target.value })}
              >
                {PLAYBOOK.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Time Window</Label>
            <Input
              value={form.timeWindow}
              onChange={(e) => setForm({ ...form, timeWindow: e.target.value })}
              placeholder="e.g. 7:15-7:45 PM Thursday"
            />
          </div>
          <div>
            <Label>Primary Bait</Label>
            <Textarea
              rows={2}
              value={form.primaryBait}
              onChange={(e) =>
                setForm({ ...form, primaryBait: e.target.value })
              }
              placeholder="DoorDash arrives, driver bumps curb, asks target to inspect..."
            />
          </div>
          <div>
            <Label>Backup Bait</Label>
            <Textarea
              rows={2}
              value={form.backupBait}
              onChange={(e) => setForm({ ...form, backupBait: e.target.value })}
              placeholder="If target won't come out, leave food and try again later."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Approach</Label>
              <Textarea
                rows={2}
                value={form.approach}
                onChange={(e) => setForm({ ...form, approach: e.target.value })}
                placeholder="Shooter behind neighbor's car."
              />
            </div>
            <div>
              <Label>Exit</Label>
              <Textarea
                rows={2}
                value={form.exit}
                onChange={(e) => setForm({ ...form, exit: e.target.value })}
                placeholder="Driver pickup at corner of 3rd and Main."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Parents Status</Label>
              <Select
                value={form.parentsStatus}
                onChange={(e) =>
                  setForm({ ...form, parentsStatus: e.target.value })
                }
              >
                <option value="unknown">Unknown</option>
                <option value="home">Home</option>
                <option value="away">Away</option>
                <option value="leaving_soon">Leaving soon</option>
              </Select>
            </div>
            <div>
              <Label>Known Allies</Label>
              <Input
                value={form.knownAllies}
                onChange={(e) =>
                  setForm({ ...form, knownAllies: e.target.value })
                }
                placeholder="Sister at home, friend in driveway..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Shooter</Label>
              <Select
                value={form.shooterPersonId}
                onChange={(e) =>
                  setForm({ ...form, shooterPersonId: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Driver</Label>
              <Select
                value={form.driverPersonId}
                onChange={(e) =>
                  setForm({ ...form, driverPersonId: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Abort Criteria</Label>
            <Textarea
              rows={2}
              value={form.abortCriteria}
              onChange={(e) =>
                setForm({ ...form, abortCriteria: e.target.value })
              }
              placeholder="Parent car in drive, target on phone with cop, neighbor watching..."
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything else."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !form.targetId}
            >
              {loading ? "Saving..." : "Save Brief"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
