CREATE TABLE `baseline_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `baseline_snapshots_feature_id_idx` ON `baseline_snapshots` (`feature_id`);