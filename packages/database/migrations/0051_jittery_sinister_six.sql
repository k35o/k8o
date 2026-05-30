CREATE TABLE `push_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`url` text,
	`dedupe_key` text NOT NULL,
	`succeeded` integer DEFAULT 0 NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL,
	`sent_at` text NOT NULL,
	CONSTRAINT "push_logs_kind_check" CHECK("push_logs"."kind" IN ('readings_updated', 'baseline_updated'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_logs_dedupe_key_idx` ON `push_logs` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `push_logs_sent_at_idx` ON `push_logs` (`sent_at`);--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`endpoint_host` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_idx` ON `push_subscriptions` (`endpoint`);