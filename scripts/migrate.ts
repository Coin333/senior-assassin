import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";

function resolveUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (raw && raw.startsWith("libsql://")) return raw;
  if (raw && raw.startsWith("file:")) return raw;
  const path = raw && raw.length > 0 ? raw : "./data/app.db";
  const abs = resolve(path);
  if (!existsSync(dirname(abs))) mkdirSync(dirname(abs), { recursive: true });
  return `file:${abs}`;
}

async function main() {
  const client = createClient({
    url: resolveUrl(),
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } catch (e) {
    console.warn("Migration warning:", (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
