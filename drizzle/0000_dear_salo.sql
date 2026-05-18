CREATE TABLE `costs` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`operation_id` text,
	`created_at` integer,
	FOREIGN KEY (`operation_id`) REFERENCES `operations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `deception_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`content` text NOT NULL,
	`scheduled_for` integer,
	`posted` integer DEFAULT false,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `equipment_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owned` integer DEFAULT false,
	`category` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lat` real,
	`lng` real,
	`address` text,
	`type` text NOT NULL,
	`person_id` text,
	`notes` text,
	`observed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text,
	`content` text NOT NULL,
	`source` text,
	`category` text DEFAULT 'observation',
	`created_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `operations` (
	`id` text PRIMARY KEY NOT NULL,
	`target_id` text NOT NULL,
	`play_type` text NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`planned_for` integer,
	`executed_at` integer,
	`approach` text,
	`exit` text,
	`primary_bait` text,
	`backup_bait` text,
	`abort_criteria` text,
	`equipment` text,
	`parents_status` text,
	`known_allies` text,
	`time_window` text,
	`location_id` text,
	`shooter_person_id` text,
	`driver_person_id` text,
	`notes` text,
	`result` text,
	`created_at` integer,
	FOREIGN KEY (`target_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shooter_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`photo_url` text,
	`role` text DEFAULT 'person' NOT NULL,
	`status` text DEFAULT 'alive',
	`threat_level` text DEFAULT 'medium',
	`phone` text,
	`notes` text,
	`address` text,
	`lat` real,
	`lng` real,
	`vehicle_make` text,
	`vehicle_model` text,
	`vehicle_color` text,
	`vehicle_year` text,
	`vehicle_plate` text,
	`vehicle_photo_url` text,
	`workplace` text,
	`workplace_address` text,
	`work_schedule` text,
	`romantic_interest_id` text,
	`week_assigned` integer,
	`snapchat_handle` text,
	`instagram_handle` text,
	`tiktok_handle` text,
	`bereal_handle` text,
	`strava_handle` text,
	`spotify_handle` text,
	`venmo_handle` text,
	`snap_map_visible` integer DEFAULT false,
	`parent_schedule` text,
	`house_map_sketch_url` text,
	`pattern_summary` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `personal_routine` (
	`id` text PRIMARY KEY NOT NULL,
	`day_of_week` integer NOT NULL,
	`hour` integer NOT NULL,
	`activity` text NOT NULL,
	`location_id` text,
	`predictability_score` integer DEFAULT 5,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`url` text NOT NULL,
	`caption` text,
	`created_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`from_person_id` text NOT NULL,
	`to_person_id` text NOT NULL,
	`type` text NOT NULL,
	`strength` integer DEFAULT 5,
	`notes` text,
	FOREIGN KEY (`from_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`week_number` integer NOT NULL,
	`target_id` text,
	`outcome` text,
	`start_date` integer,
	`end_date` integer,
	`method` text,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`target_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schedule_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`hour` integer NOT NULL,
	`activity` text NOT NULL,
	`location_id` text,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `suspicious_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`location_id` text,
	`suspected_person_id` text,
	`threat_level` text DEFAULT 'low',
	`created_at` integer,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`suspected_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`operation_id` text,
	`author_name` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`operation_id`) REFERENCES `operations`(`id`) ON UPDATE no action ON DELETE cascade
);
