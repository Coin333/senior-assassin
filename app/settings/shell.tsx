"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { Skull, Save, LogOut } from "lucide-react";

export function SettingsShell({
  initial,
}: {
  initial: Record<string, string | null>;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    bracket_size: initial.bracket_size || "64",
    league_name: initial.league_name || "",
    current_week: initial.current_week || "1",
    endgame_mode: initial.endgame_mode === "true",
    your_name: initial.your_name || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const entries = [
      { key: "bracket_size", value: settings.bracket_size },
      { key: "league_name", value: settings.league_name },
      { key: "current_week", value: settings.current_week },
      { key: "endgame_mode", value: settings.endgame_mode ? "true" : "false" },
      { key: "your_name", value: settings.your_name },
    ];
    for (const e of entries) {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader title="League" />
        <div className="p-4 space-y-3">
          <div>
            <Label>Your name</Label>
            <Input
              value={settings.your_name}
              onChange={(e) =>
                setSettings({ ...settings, your_name: e.target.value })
              }
              placeholder="Caleb"
            />
          </div>
          <div>
            <Label>League name</Label>
            <Input
              value={settings.league_name}
              onChange={(e) =>
                setSettings({ ...settings, league_name: e.target.value })
              }
              placeholder="Lincoln High Class of 2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bracket size</Label>
              <Input
                type="number"
                value={settings.bracket_size}
                onChange={(e) =>
                  setSettings({ ...settings, bracket_size: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Current week</Label>
              <Input
                type="number"
                value={settings.current_week}
                onChange={(e) =>
                  setSettings({ ...settings, current_week: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Mode" />
        <div className="p-4 space-y-4">
          <button
            onClick={() =>
              setSettings({ ...settings, endgame_mode: !settings.endgame_mode })
            }
            className={`w-full p-4 rounded-lg border text-left cursor-pointer transition-all ${
              settings.endgame_mode
                ? "bg-red-500/10 border-red-500/40"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${settings.endgame_mode ? "bg-red-500/20 text-red-300" : "bg-zinc-800 text-zinc-500"}`}
              >
                <Skull className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${settings.endgame_mode ? "text-red-300" : "text-zinc-200"}`}
                >
                  Endgame Mode
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Tightens defense reminders. Auto-hides risky data on screen.
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full border transition-all ${settings.endgame_mode ? "bg-red-500/30 border-red-500/60" : "bg-zinc-800 border-zinc-700"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-100 mt-0.5 transition-all ${settings.endgame_mode ? "ml-5" : "ml-0.5"}`}
                />
              </div>
            </div>
          </button>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
            Activate when you reach top 5. Everyone is hunting you.
          </p>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Session" />
        <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-zinc-500">
            All data lives in a local SQLite database on the server. Backups are
            your responsibility.
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-emerald-400 font-mono">SAVED</span>
            )}
            <Button variant="primary" onClick={save} disabled={saving}>
              <Save className="w-3.5 h-3.5" />{" "}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
