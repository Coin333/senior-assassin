import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "sa_session";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function isAuthenticated() {
  const password = process.env.APP_PASSWORD;
  if (!password) return true;
  const jar = await cookies();
  const session = jar.get(COOKIE_NAME)?.value;
  if (!session) return false;
  return session === hashPassword(password);
}

export async function login(password: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return true;
  if (password !== expected) return false;
  const jar = await cookies();
  jar.set(COOKIE_NAME, hashPassword(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return true;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
