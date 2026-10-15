CREATE TABLE `ai_artifact_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artifact_id` text NOT NULL,
	`version` integer NOT NULL,
	`parent_id` integer,
	`thread_id` text,
	`title` text NOT NULL,
	`instruction` text NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`artifact_id`) REFERENCES `ai_artifacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `ai_threads`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_artifact_versions_artifact_version_idx` ON `ai_artifact_versions` (`artifact_id`,`version`);--> statement-breakpoint
CREATE TABLE `ai_artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
