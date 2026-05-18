"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Send, Shield } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Msg = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | null;
};

export function TeamChat({ messages }: { messages: Msg[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [name, setName] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("sa_chat_name") || ""
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text.trim() || !name.trim()) return;
    setLoading(true);
    if (typeof window !== "undefined")
      localStorage.setItem("sa_chat_name", name);
    await fetch("/api/team-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: name, content: text }),
    });
    setText("");
    setLoading(false);
    router.refresh();
  }

  async function checkIn() {
    if (!name.trim()) return;
    await fetch("/api/team-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: name,
        content: "I am safe. Clean exit confirmed.",
      }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500 text-center">
            No messages yet.
            <br />
            Set your handle, drop a brief, or check in.
          </div>
        ) : (
          [...messages].reverse().map((m) => (
            <div
              key={m.id}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-md p-2.5"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                  {m.authorName.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                  {m.authorName}
                </span>
                <span className="text-[9px] font-mono text-zinc-600 ml-auto">
                  {timeAgo(m.createdAt)}
                </span>
              </div>
              <p className="text-xs text-zinc-200">{m.content}</p>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-zinc-800/60 p-3 space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your handle (saved locally)"
        />
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Drop a message..."
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button
            onClick={send}
            disabled={loading || !text.trim() || !name.trim()}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        <button
          onClick={checkIn}
          disabled={!name.trim()}
          className="w-full text-[10px] font-mono uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-md py-1.5 transition-all disabled:opacity-30 cursor-pointer"
        >
          <Shield className="w-3 h-3 inline mr-1" /> I AM SAFE CHECK-IN
        </button>
      </div>
    </div>
  );
}
