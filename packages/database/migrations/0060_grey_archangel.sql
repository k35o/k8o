CREATE TABLE `ai_share_serves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_share_serves_created_at_idx` ON `ai_share_serves` (`created_at`);