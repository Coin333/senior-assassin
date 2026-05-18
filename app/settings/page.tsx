import { db, schema } from "@/lib/db";
import { PageBody, PageHeader, Card, CardHeader } from "@/components/ui";
import { SettingsShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rows = await db.select().from(schema.settings);
  const settings: Record<string, string | null> = {};
  for (const r of rows) settings[r.key] = r.value;
  return (
    <>
      <PageHeader
        meta="CONFIGURATION // SETTINGS"
        title="Settings"
        subtitle="Game state, modes, and personal preferences."
      />
      <PageBody>
        <SettingsShell initial={settings} />
      </PageBody>
    </>
  );
}
