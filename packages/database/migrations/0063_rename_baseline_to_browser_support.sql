PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_browser_support_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "browser_support_snapshots_status_check" CHECK("__new_browser_support_snapshots"."status" IN ('newly', 'widely'))
);
--> statement-breakpoint
INSERT INTO `__new_browser_support_snapshots`("id", "feature_id", "name", "status", "date", "created_at", "updated_at") SELECT "id", "feature_id", "name", "status", "date", "created_at", "updated_at" FROM `baseline_snapshots`;--> statement-breakpoint
DROP TABLE `baseline_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_browser_support_snapshots` RENAME TO `browser_support_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `browser_support_snapshots_feature_id_idx` ON `browser_support_snapshots` (`feature_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_push_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`url` text,
	`dedupe_key` text NOT NULL,
	`succeeded` integer DEFAULT 0 NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL,
	`sent_at` text NOT NULL,
	CONSTRAINT "push_logs_kind_check" CHECK("__new_push_logs"."kind" IN ('readings_updated', 'browser_support_updated'))
);
--> statement-breakpoint
INSERT INTO `__new_push_logs`("id", "kind", "title", "body", "url", "dedupe_key", "succeeded", "failed", "sent_at") SELECT "id", CASE WHEN "kind" = 'baseline_updated' THEN 'browser_support_updated' ELSE "kind" END, "title", "body", "url", "dedupe_key", "succeeded", "failed", "sent_at" FROM `push_logs`;--> statement-breakpoint
DROP TABLE `push_logs`;--> statement-breakpoint
ALTER TABLE `__new_push_logs` RENAME TO `push_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `push_logs_dedupe_key_idx` ON `push_logs` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `push_logs_sent_at_idx` ON `push_logs` (`sent_at`);
