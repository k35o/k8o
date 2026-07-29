CREATE TABLE `browser_support_datasets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upstream_version` text NOT NULL,
	`state` text NOT NULL,
	`data` text NOT NULL,
	`ingested_at` text NOT NULL,
	CONSTRAINT "browser_support_datasets_state_check" CHECK("browser_support_datasets"."state" IN ('active', 'superseded'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `browser_support_datasets_upstream_version_idx` ON `browser_support_datasets` (`upstream_version`);--> statement-breakpoint
CREATE INDEX `browser_support_datasets_state_idx` ON `browser_support_datasets` (`state`);--> statement-breakpoint
CREATE TABLE `browser_support_sync_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trigger` text NOT NULL,
	`result` text NOT NULL,
	`upstream_version` text,
	`detail` text,
	`duration_ms` integer,
	`created_at` text NOT NULL,
	CONSTRAINT "browser_support_sync_runs_trigger_check" CHECK("browser_support_sync_runs"."trigger" IN ('cron', 'manual', 'monitor')),
	CONSTRAINT "browser_support_sync_runs_result_check" CHECK("browser_support_sync_runs"."result" IN ('applied', 'noop', 'skipped_major', 'fetch_failed', 'validation_failed', 'db_failed'))
);
--> statement-breakpoint
CREATE INDEX `browser_support_sync_runs_created_at_idx` ON `browser_support_sync_runs` (`created_at`);--> statement-breakpoint
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
	CONSTRAINT "push_logs_kind_check" CHECK("__new_push_logs"."kind" IN ('readings_updated', 'browser_support_updated', 'browser_support_alert'))
);
--> statement-breakpoint
INSERT INTO `__new_push_logs`("id", "kind", "title", "body", "url", "dedupe_key", "succeeded", "failed", "sent_at") SELECT "id", "kind", "title", "body", "url", "dedupe_key", "succeeded", "failed", "sent_at" FROM `push_logs`;--> statement-breakpoint
DROP TABLE `push_logs`;--> statement-breakpoint
ALTER TABLE `__new_push_logs` RENAME TO `push_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `push_logs_dedupe_key_idx` ON `push_logs` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `push_logs_sent_at_idx` ON `push_logs` (`sent_at`);