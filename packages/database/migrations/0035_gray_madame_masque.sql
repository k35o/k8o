PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_baseline_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "baseline_snapshots_status_check" CHECK("__new_baseline_snapshots"."status" IN ('newly', 'widely'))
);
--> statement-breakpoint
INSERT INTO `__new_baseline_snapshots`("id", "feature_id", "name", "status", "date", "created_at", "updated_at") SELECT "id", "feature_id", "name", "status", "date", "created_at", "updated_at" FROM `baseline_snapshots`;--> statement-breakpoint
DROP TABLE `baseline_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_baseline_snapshots` RENAME TO `baseline_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `baseline_snapshots_feature_id_idx` ON `baseline_snapshots` (`feature_id`);