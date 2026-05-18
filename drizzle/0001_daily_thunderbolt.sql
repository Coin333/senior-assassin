ALTER TABLE `people` ALTER COLUMN "role" TO "role" text NOT NULL DEFAULT 'neutral';--> statement-breakpoint
ALTER TABLE `people` ADD `side` text DEFAULT 'neutral' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `associated_target_id` text;--> statement-breakpoint
ALTER TABLE `people` ADD `relationship_to_target` text;