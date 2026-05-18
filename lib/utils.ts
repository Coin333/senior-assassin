import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string | number | null | undefined) {
  if (!date) return "never";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "alive":
      return "alive";
    case "eliminated":
      return "eliminated";
    case "eliminated_me":
      return "eliminated by me";
    case "assigned":
      return "assigned";
    default:
      return status ? status.replace(/_/g, " ") : "unknown";
  }
}

export function statusColor(status: string | null | undefined) {
  switch (status) {
    case "alive":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "eliminated":
      return "bg-zinc-700/30 text-zinc-400 border-zinc-700";
    case "eliminated_me":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "assigned":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

export function threatColor(level: string | null | undefined) {
  switch (level) {
    case "high":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const PLAYBOOK = [
  {
    id: "doordash",
    name: "DoorDash Bait",
    parentsHome: true,
    summary: "Fake order plus curb bump or mailbox decoy.",
  },
  {
    id: "recruiter",
    name: "College Recruiter",
    parentsHome: true,
    summary: "Coach with clipboard, 10-min time pressure.",
  },
  {
    id: "headlights",
    name: "Headlights Are On",
    parentsHome: true,
    summary: "LED in grill, knock to alert.",
  },
  {
    id: "car_alarm",
    name: "Car Alarm",
    parentsHome: true,
    summary: "Bluetooth speaker, stop on door open.",
  },
  {
    id: "lost_dog",
    name: "Lost Dog",
    parentsHome: false,
    summary: "Sympathetic friend with leash, side-yard ambush.",
  },
  {
    id: "fender_bender",
    name: "Fender Bender",
    parentsHome: true,
    summary: "Staged accident pulls target outside.",
  },
  {
    id: "wrong_address",
    name: "Wrong-Address Package",
    parentsHome: true,
    summary: "Reach for package, step off porch.",
  },
  {
    id: "stranded_driver",
    name: "Stranded Driver",
    parentsHome: false,
    summary: "Helpless driver asks for water/charger.",
  },
  {
    id: "crush_call",
    name: "Crush Outside",
    parentsHome: true,
    summary: "Romantic interest texts to come outside.",
  },
  {
    id: "team_emergency",
    name: "Coach/Team Emergency",
    parentsHome: true,
    summary: "Athlete bait, urgent practice call.",
  },
];

export const STALLS = [
  {
    id: "mutual_intercept",
    label: "Friendly Mutual Intercept",
    duration: "15-20s",
    situation: "parking_lot",
  },
  {
    id: "underclassman_ask",
    label: "Underclassman Ask",
    duration: "30s+",
    situation: "parking_lot",
  },
  {
    id: "compliment",
    label: "Compliment Trap",
    duration: "15s",
    situation: "any",
  },
  {
    id: "gossip_drop",
    label: "Gossip Drop",
    duration: "60s+",
    situation: "any",
  },
  {
    id: "romantic",
    label: "Romantic Interest Stall",
    duration: "60s+",
    situation: "any",
  },
  {
    id: "engineered_text",
    label: "Engineered Urgent Text",
    duration: "15-30s",
    situation: "any",
  },
  {
    id: "fake_call",
    label: "Fake Call (must watch video)",
    duration: "30s",
    situation: "any",
  },
  {
    id: "windshield_note",
    label: "Note on Windshield",
    duration: "60s+",
    situation: "car",
  },
  {
    id: "is_that_your_car",
    label: '"Is That Your Car?"',
    duration: "60s+",
    situation: "car",
  },
  {
    id: "fake_ticket",
    label: "Fake Parking Ticket",
    duration: "90s",
    situation: "car",
  },
  {
    id: "lost_airpod",
    label: "Lost AirPod Search",
    duration: "30-60s",
    situation: "any",
  },
  {
    id: "jumper_cables",
    label: "Jumper Cables Ask",
    duration: "60s-3min",
    situation: "car",
  },
  {
    id: "petition",
    label: "Flyer/Petition",
    duration: "15-60s",
    situation: "any",
  },
];

export const EQUIPMENT_DEFAULTS = [
  { name: "Slime gun (primary)", category: "weapon" },
  { name: "Slime gun (backup)", category: "weapon" },
  { name: "Refill ammo", category: "weapon" },
  { name: "GoPro / chest cam", category: "recording" },
  { name: "Burner phone", category: "comms" },
  { name: "DoorDash hat", category: "disguise" },
  { name: "DoorDash insulated bag", category: "disguise" },
  { name: "Polo + clipboard (recruiter)", category: "disguise" },
  { name: "Stopwatch (recruiter)", category: "disguise" },
  { name: "Printed business cards", category: "disguise" },
  { name: "Dog leash (lost dog)", category: "disguise" },
  { name: "Bluetooth speaker", category: "effect" },
  { name: "LED keychain light", category: "effect" },
  { name: "Real bouquet (florist)", category: "effect" },
  { name: "Fake package", category: "effect" },
  { name: "Fake parking ticket prints", category: "effect" },
  { name: "Sunglasses + hat (disguise)", category: "disguise" },
  { name: "Reversible jacket", category: "disguise" },
];
