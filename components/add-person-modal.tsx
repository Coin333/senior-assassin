"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "./ui";

export function AddPersonModal({
  defaultRole = "target",
}: {
  defaultRole?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: defaultRole,
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
    photoUrl: "",
    notes: "",
  });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        weekAssigned: form.weekAssigned
          ? parseInt(form.weekAssigned, 10)
          : null,
      }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
    setForm({
      ...form,
      name: "",
      address: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      vehiclePlate: "",
      workplace: "",
      notes: "",
      photoUrl: "",
    });
  }

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
                  Add {defaultRole === "target" ? "Target" : "Person"}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={submit}
              className="overflow-y-auto p-4 sm:p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="target">Target</option>
                    <option value="friend">Friend (of target)</option>
                    <option value="asset">Asset (your team)</option>
                    <option value="family">Family member</option>
                    <option value="person">Person</option>
                  </Select>
                </div>
              </div>
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
                    <option value="eliminated">Eliminated</option>
                    <option value="eliminated_me">Eliminated me</option>
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
              <div>
                <Label>Home address</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="123 Main St, Anytown"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label>Make</Label>
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
                  <Label>Snapchat</Label>
                  <Input
                    value={form.snapchatHandle}
                    onChange={(e) =>
                      setForm({ ...form, snapchatHandle: e.target.value })
                    }
                    placeholder="@username"
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Pattern of life, weak spots..."
                />
              </div>
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
