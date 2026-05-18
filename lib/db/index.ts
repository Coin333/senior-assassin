import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import * as schema from "./schema";

function resolveUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (raw && raw.startsWith("libsql://")) return raw;
  if (raw && raw.startsWith("file:")) return raw;
  const path = raw && raw.length > 0 ? raw : "./data/app.db";
  const abs = resolve(path);
  if (!existsSync(dirname(abs))) {
    mkdirSync(dirname(abs), { recursive: true });
  }
  return `file:${abs}`;
}

const client = createClient({
  url: resolveUrl(),
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
