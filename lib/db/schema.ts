import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const people = sqliteTable("people", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  // What kind of person they are: target, ally, family, friend, romantic, coworker, teammate, neutral
  role: text("role").notNull().default("neutral"),
  // Whose team they're on: mine (your side), target (target's side), neutral
  side: text("side").notNull().default("neutral"),
  // If side === "target", which target they're connected to (FK to people.id with role=target)
  associatedTargetId: text("associated_target_id"),
  // How they relate to the associated target: friend, family, romantic, coworker, teammate, other
  relationshipToTarget: text("relationship_to_target"),
  status: text("status").default("alive"),
  threatLevel: text("threat_level").default("medium"),
  phone: text("phone"),
  notes: text("notes"),
  address: text("address"),
  lat: real("lat"),
  lng: real("lng"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleColor: text("vehicle_color"),
  vehicleYear: text("vehicle_year"),
  vehiclePlate: text("vehicle_plate"),
  vehiclePhotoUrl: text("vehicle_photo_url"),
  workplace: text("workplace"),
  workplaceAddress: text("workplace_address"),
  workSchedule: text("work_schedule"),
  romanticInterestId: text("romantic_interest_id"),
  weekAssigned: integer("week_assigned"),
  snapchatHandle: text("snapchat_handle"),
  instagramHandle: text("instagram_handle"),
  tiktokHandle: text("tiktok_handle"),
  beRealHandle: text("bereal_handle"),
  stravaHandle: text("strava_handle"),
  spotifyHandle: text("spotify_handle"),
  venmoHandle: text("venmo_handle"),
  snapMapVisible: integer("snap_map_visible", { mode: "boolean" }).default(
    false,
  ),
  parentSchedule: text("parent_schedule"),
  houseMapSketchUrl: text("house_map_sketch_url"),
  patternSummary: text("pattern_summary"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const photos = sqliteTable("photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const relationships = sqliteTable("relationships", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  fromPersonId: text("from_person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  toPersonId: text("to_person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  strength: integer("strength").default(5),
  notes: text("notes"),
});

export const locations = sqliteTable("locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  address: text("address"),
  type: text("type").notNull(),
  personId: text("person_id").references(() => people.id, {
    onDelete: "cascade",
  }),
  notes: text("notes"),
  observedAt: integer("observed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const scheduleEntries = sqliteTable("schedule_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  hour: integer("hour").notNull(),
  activity: text("activity").notNull(),
  locationId: text("location_id").references(() => locations.id),
});

export const notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  personId: text("person_id").references(() => people.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  source: text("source"),
  category: text("category").default("observation"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const operations = sqliteTable("operations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  targetId: text("target_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  playType: text("play_type").notNull(),
  status: text("status").notNull().default("planning"),
  plannedFor: integer("planned_for", { mode: "timestamp" }),
  executedAt: integer("executed_at", { mode: "timestamp" }),
  approach: text("approach"),
  exit: text("exit"),
  primaryBait: text("primary_bait"),
  backupBait: text("backup_bait"),
  abortCriteria: text("abort_criteria"),
  equipment: text("equipment"),
  parentsStatus: text("parents_status"),
  knownAllies: text("known_allies"),
  timeWindow: text("time_window"),
  locationId: text("location_id").references(() => locations.id),
  shooterPersonId: text("shooter_person_id").references(() => people.id),
  driverPersonId: text("driver_person_id").references(() => people.id),
  notes: text("notes"),
  result: text("result"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const equipmentItems = sqliteTable("equipment_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  owned: integer("owned", { mode: "boolean" }).default(false),
  category: text("category"),
  notes: text("notes"),
});

export const costs = sqliteTable("costs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  operationId: text("operation_id").references(() => operations.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const suspiciousActivity = sqliteTable("suspicious_activity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  description: text("description").notNull(),
  locationId: text("location_id").references(() => locations.id),
  suspectedPersonId: text("suspected_person_id").references(() => people.id),
  threatLevel: text("threat_level").default("low"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const personalRoutine = sqliteTable("personal_routine", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  dayOfWeek: integer("day_of_week").notNull(),
  hour: integer("hour").notNull(),
  activity: text("activity").notNull(),
  locationId: text("location_id").references(() => locations.id),
  predictabilityScore: integer("predictability_score").default(5),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export const rounds = sqliteTable("rounds", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  weekNumber: integer("week_number").notNull(),
  targetId: text("target_id").references(() => people.id),
  outcome: text("outcome"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  method: text("method"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const teamMessages = sqliteTable("team_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  operationId: text("operation_id").references(() => operations.id, {
    onDelete: "cascade",
  }),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const deceptionPosts = sqliteTable("deception_posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }),
  posted: integer("posted", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type Relationship = typeof relationships.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Operation = typeof operations.$inferSelect;
export type NoteRow = typeof notes.$inferSelect;
export type Round = typeof rounds.$inferSelect;
