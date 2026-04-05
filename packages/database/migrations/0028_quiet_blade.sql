CREATE TABLE `reporting_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reporting_reports_type_idx` ON `reporting_reports` (`type`);--> statement-breakpoint
CREATE INDEX `reporting_reports_created_at_idx` ON `reporting_reports` (`created_at`);