import { db, schema } from "@/lib/db";
import { PageBody, PageHeader } from "@/components/ui";
import { AddPersonModal } from "@/components/add-person-modal";
import { NetworkView } from "./view";

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  const people = await db.select().from(schema.people);
  const rels = await db.select().from(schema.relationships);

  return (
    <>
      <PageHeader
        meta="HUMAN INTELLIGENCE // WEB"
        title="Network"
        subtitle={`${people.length} tracked, ${rels.length} known links. Click any node to open their profile.`}
        action={<AddPersonModal defaultRole="person" />}
      />
      <PageBody>
        <NetworkView
          people={people.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
            side: p.side,
            status: p.status,
            threatLevel: p.threatLevel,
            photoUrl: p.photoUrl,
          }))}
          relationships={rels.map((r) => ({
            id: r.id,
            fromPersonId: r.fromPersonId,
            toPersonId: r.toPersonId,
            type: r.type,
          }))}
        />
      </PageBody>
    </>
  );
}
