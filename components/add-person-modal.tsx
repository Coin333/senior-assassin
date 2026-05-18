"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "./ui";

type TargetOption = { id: string; name: string };

const ROLE_OPTIONS = [
  { value: "target", label: "Target" },
  { value: "ally", label: "Ally (your team)" },
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic interest" },
  { value: "coworker", label: "Coworker" },
  { value: "teammate", label: "Teammate" },
  { value: "neutral", label: "Neutral / mutual" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "best_friend", label: "Best friend" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic interest" },
  { value: "coworker", label: "Coworker" },
  { value: "teammate", label: "Teammate" },
  { value: "sibling", label: "Sibling" },
  { value: "parent", label: "Parent" },
  { value: "other", label: "Other" },
];

function inferSide(role: string) {
  if (role === "target") return "target";
  if (role === "ally") return "mine";
  return "neutral";
}

export function AddPersonModal({
  defaultRole = "target",
}: {
  defaultRole?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState<TargetOption[]>([]);
  const router = useRouter();

  const initialForm = {
    name: "",
    role: defaultRole,
    side: inferSide(defaultRole),
    associatedTargetId: "",
    relationshipToTarget: "",
    threatLevel: "medium",
    status: "alive",
    address: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehiclePlate: "",
    workplace: "",
    weekAssigned: "",
    snapchatHandle: "",
    instagramHandle: "",
    tiktokHandle: "",
    photoUrl: "",
    phone: "",
    notes: "",
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    fetch("/api/people?role=target")
      .then((r) => r.json())
      .then((d) => setTargets(d.data ?? []))
      .catch(() => setTargets([]));
  }, [open]);

  // Auto-sync side when role changes
  function setRole(role: string) {
    setForm((f) => ({
      ...f,
      role,
      side: inferSide(role),
      associatedTargetId: role === "target" ? "" : f.associatedTargetId,
      relationshipToTarget: role === "target" ? "" : f.relationshipToTarget,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    const payload = {
      ...form,
      weekAssigned: form.weekAssigned ? parseInt(form.weekAssigned, 10) : null,
      associatedTargetId: form.associatedTargetId || null,
      relationshipToTarget: form.relationshipToTarget || null,
    };
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
    setForm({
      ...initialForm,
      role: defaultRole,
      side: inferSide(defaultRole),
    });
  }

  const isTarget = form.role === "target";
  const showTargetLink =
    !isTarget &&
    (form.side === "target" || form.side === "mine" || form.side === "neutral");

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="primary">
        <Plus className="w-3.5 h-3.5" />
        Add {defaultRole === "target" ? "Target" : "Person"}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:pl-[17rem]">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500">
                  NEW RECORD
                </div>
                <h2 className="text-base font-semibold text-zinc-100">
                  Add {isTarget ? "Target" : "Person"}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={submit}
              className="overflow-y-auto p-4 sm:p-5 space-y-4"
            >
              <section className="space-y-3">
                <SectionHeader label="Identity" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label>Photo URL</Label>
                    <Input
                      value={form.photoUrl}
                      onChange={(e) =>
                        setForm({ ...form, photoUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeader label="Allegiance" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Side</Label>
                    <Select
                      value={form.side}
                      onChange={(e) =>
                        setForm({ ...form, side: e.target.value })
                      }
                      disabled={isTarget}
                    >
                      <option value="mine">My side (ally)</option>
                      <option value="target">
                        Target&apos;s side (enemy adjacent)
                      </option>
                      <option value="neutral">Neutral</option>
                    </Select>
                  </div>
                </div>

                {showTargetLink && targets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <div>
                      <Label>Associated with target (optional)</Label>
                      <Select
                        value={form.associatedTargetId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            associatedTargetId: e.target.value,
                          })
                        }
                      >
                        <option value="">No specific target</option>
                        {targets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Relationship to that target</Label>
                      <Select
                        value={form.relationshipToTarget}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            relationshipToTarget: e.target.value,
                          })
                        }
                        disabled={!form.associatedTargetId}
                      >
                        <option value="">Pick relationship</option>
                        {RELATIONSHIP_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <p className="sm:col-span-2 text-[11px] text-zinc-500">
                      Linking auto-creates a connection in the network graph.
                    </p>
                  </div>
                )}
              </section>

              {isTarget && (
                <section className="space-y-3">
                  <SectionHeader label="Target Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="alive">Alive</option>
                        <option value="eliminated">Eliminated (other)</option>
                        <option value="eliminated_me">I killed them</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Threat</Label>
                      <Select
                        value={form.threatLevel}
                        onChange={(e) =>
                          setForm({ ...form, threatLevel: e.target.value })
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Week assigned</Label>
                      <Input
                        type="number"
                        value={form.weekAssigned}
                        onChange={(e) =>
                          setForm({ ...form, weekAssigned: e.target.value })
                        }
                        placeholder="1"
                      />
                    </div>
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <SectionHeader label="Whereabouts" />
                <div>
                  <Label>Home address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label>Veh. make</Label>
                    <Input
                      value={form.vehicleMake}
                      onChange={(e) =>
                        setForm({ ...form, vehicleMake: e.target.value })
                      }
                      placeholder="Honda"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={form.vehicleModel}
                      onChange={(e) =>
                        setForm({ ...form, vehicleModel: e.target.value })
                      }
                      placeholder="Civic"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      value={form.vehicleColor}
                      onChange={(e) =>
                        setForm({ ...form, vehicleColor: e.target.value })
                      }
                      placeholder="Silver"
                    />
                  </div>
                  <div>
                    <Label>Plate</Label>
                    <Input
                      value={form.vehiclePlate}
                      onChange={(e) =>
                        setForm({ ...form, vehiclePlate: e.target.value })
                      }
                      placeholder="ABC1234"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Workplace</Label>
                    <Input
                      value={form.workplace}
                      onChange={(e) =>
                        setForm({ ...form, workplace: e.target.value })
                      }
                      placeholder="Chick-fil-A"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="555-..."
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeader label="Socials" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Snapchat</Label>
                    <Input
                      value={form.snapchatHandle}
                      onChange={(e) =>
                        setForm({ ...form, snapchatHandle: e.target.value })
                      }
                      placeholder="@user"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={form.instagramHandle}
                      onChange={(e) =>
                        setForm({ ...form, instagramHandle: e.target.value })
                      }
                      placeholder="@user"
                    />
                  </div>
                  <div>
                    <Label>TikTok</Label>
                    <Input
                      value={form.tiktokHandle}
                      onChange={(e) =>
                        setForm({ ...form, tiktokHandle: e.target.value })
                      }
                      placeholder="@user"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <SectionHeader label="Notes" />
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Pattern of life, weak spots..."
                />
              </section>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !form.name}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] font-mono tracking-[0.22em] uppercase text-red-400/80">
        {label}
      </div>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  );
}
