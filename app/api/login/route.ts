import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (typeof password !== "string")
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  const ok = await login(password);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
