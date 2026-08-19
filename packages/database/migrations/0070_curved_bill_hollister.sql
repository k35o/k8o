CREATE TABLE `browser_support_feature_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_id` text NOT NULL,
	`feature_name` text NOT NULL,
	`status` text NOT NULL,
	`previous_status` text,
	`upstream_version` text NOT NULL,
	`changed_at` text NOT NULL,
	CONSTRAINT "browser_support_feature_changes_status_check" CHECK("browser_support_feature_changes"."status" IN ('newly', 'widely')),
	CONSTRAINT "browser_support_feature_changes_previous_status_check" CHECK("browser_support_feature_changes"."previous_status" IS NULL OR "browser_support_feature_changes"."previous_status" IN ('newly', 'widely'))
);
--> statement-breakpoint
CREATE INDEX `browser_support_feature_changes_changed_at_idx` ON `browser_support_feature_changes` (`changed_at`);