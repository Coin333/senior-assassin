import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL?.trim() || "file:./data/app.db";
const normalizedUrl =
  url.startsWith("libsql://") || url.startsWith("file:") ? url : `file:${url}`;

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: normalizedUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
