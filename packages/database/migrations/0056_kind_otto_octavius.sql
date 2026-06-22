CREATE TABLE `ai_project_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`parent_id` integer,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `ai_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_project_versions_project_id_idx` ON `ai_project_versions` (`project_id`);--> statement-breakpoint
CREATE TABLE `ai_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`fork_of` integer,
	`published_version_id` integer,
	`public_snapshot` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_projects_slug_idx` ON `ai_projects` (`slug`);--> statement-breakpoint
CREATE INDEX `ai_projects_user_id_idx` ON `ai_projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `ai_projects_app_idx` ON `ai_projects` (`app`);--> statement-breakpoint
CREATE TABLE `ai_usages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`input_tokens` integer,
	`output_tokens` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_usages_user_id_idx` ON `ai_usages` (`user_id`);--> statement-breakpoint
CREATE INDEX `ai_usages_created_at_idx` ON `ai_usages` (`created_at`);