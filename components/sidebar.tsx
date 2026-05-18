"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Network,
  Map,
  Swords,
  Trophy,
  Users,
  Shield,
  Settings,
  Menu,
  X,
  Skull,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Brief", icon: LayoutDashboard },
  { href: "/targets", label: "Targets", icon: Crosshair },
  { href: "/network", label: "Network", icon: Network },
  { href: "/map", label: "Map", icon: Map },
  { href: "/plays", label: "Plays", icon: Swords },
  { href: "/bracket", label: "Bracket", icon: Trophy },
  { href: "/team", label: "Team", icon: Users },
  { href: "/defense", label: "Defense", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-lg shadow-black/40"
        aria-label="Menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 z-40 flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="px-5 py-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Skull className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-[0.2em] text-zinc-500">
                SR ASSASSIN
              </div>
              <div className="text-sm font-bold text-zinc-100 leading-none mt-0.5">
                COMMAND
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  active
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-500">
              OPERATIONAL
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
