import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { PageBody, PageHeader, Stat, Card } from "@/components/ui";
import { MapShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const locations = await db
    .select()
    .from(schema.locations)
    .orderBy(desc(schema.locations.createdAt));
  const people = await db.select().from(schema.people);
  const peopleMap = new Map(people.map((p) => [p.id, p.name]));

  const pins = locations
    .filter((l) => l.lat !== null && l.lng !== null)
    .map((l) => ({
      id: l.id,
      name: l.name,
      lat: l.lat as number,
      lng: l.lng as number,
      type: l.type,
      personId: l.personId,
      personName: l.personId ? (peopleMap.get(l.personId) ?? null) : null,
      observedAt: l.observedAt,
      createdAt: l.createdAt,
    }));

  const typeCounts = pins.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        meta="GEOSPATIAL // UNIFIED MAP"
        title="Map"
        subtitle={`${pins.length} geo-pinned locations across ${Object.keys(typeCounts).length} categories. Snap Map checks, hangouts, gas stations, all on one view.`}
      />
      <PageBody className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <Stat label="Pinned" value={pins.length} color="red" />
          </Card>
          <Card>
            <Stat
              label="Snap Checks"
              value={typeCounts["snap_check"] || 0}
              color="amber"
            />
          </Card>
          <Card>
            <Stat
              label="Target Homes"
              value={typeCounts["target_home"] || 0}
              color="red"
            />
          </Card>
          <Card>
            <Stat
              label="Safe Zones"
              value={typeCounts["safe_zone"] || 0}
              color="emerald"
            />
          </Card>
        </div>
        <MapShell pins={pins} />
      </PageBody>
    </>
  );
}
