"use client";
import { useState } from "react";
import { Skull, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setErr("Enter your access code.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      if (res.status === 401) setErr("Wrong access code. Try again.");
      else setErr("Login failed. Check your connection and retry.");
      setLoading(false);
    } catch {
      setErr("Network error. Check your connection.");
      setLoading(false);
    }
  }

  function onChange(value: string) {
    setPassword(value);
    if (err) setErr("");
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Access code"
              autoFocus
              aria-invalid={!!err}
              aria-describedby={err ? "login-error" : undefined}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-3 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {err && (
            <div
              id="login-error"
              role="alert"
              className="text-xs text-red-400 font-mono"
            >
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25 hover:border-red-500/60 rounded-md py-2.5 text-sm font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Verifying" : "Enter Command"}
          </button>
        </form>
      </div>
    </div>
  );
}
