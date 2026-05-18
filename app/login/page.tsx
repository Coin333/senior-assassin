"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skull } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) router.push("/");
    else setErr("Invalid credentials");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 grid-bg">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center glow-red">
            <Skull className="w-7 h-7 text-red-400" />
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-2">
            SR ASSASSIN // CMD
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">Authenticate</h1>
          <p className="mt-1 text-sm text-zinc-500">Operational access only.</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 backdrop-blur"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
            autoFocus
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
          />
          {err && <div className="text-xs text-red-400 font-mono">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25 hover:border-red-500/60 rounded-md py-2.5 text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter Command"}
          </button>
        </form>
      </div>
    </div>
  );
}
