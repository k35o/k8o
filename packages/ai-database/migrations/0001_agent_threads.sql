CREATE TABLE `ai_thread_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`thread_id` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `ai_threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_thread_messages_thread_id_idx` ON `ai_thread_messages` (`thread_id`);--> statement-breakpoint
CREATE TABLE `ai_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`model` text NOT NULL,
	`run_id` text,
	`run_heartbeat_at` text,
	`stop_requested_at` text,
	`last_input_tokens` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_threads_user_id_idx` ON `ai_threads` (`user_id`);--> statement-breakpoint
ALTER TABLE `ai_usages` ADD `model` text;--> statement-breakpoint
ALTER TABLE `ai_usages` ADD `cache_read_tokens` integer;--> statement-breakpoint
ALTER TABLE `ai_usages` ADD `cache_write_tokens` integer;--> statement-breakpoint
ALTER TABLE `ai_usages` ADD `cost_micro_usd` integer;