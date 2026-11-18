PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_talks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text,
	`event_url` text NOT NULL,
	`event_name` text NOT NULL,
	`event_date` text NOT NULL,
	`event_location` text,
	`slide_url` text,
	`blog_id` integer,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_talks`("id", "title", "slug", "event_url", "event_name", "event_date", "event_location", "slide_url", "blog_id") SELECT "id", "title", NULL, "event_url", "event_name", "event_date", "event_location", "slide_url", "blog_id" FROM `talks`;--> statement-breakpoint
DROP TABLE `talks`;--> statement-breakpoint
ALTER TABLE `__new_talks` RENAME TO `talks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `talks_blog_id_idx` ON `talks` (`blog_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `talks_slug_idx` ON `talks` (`slug`);