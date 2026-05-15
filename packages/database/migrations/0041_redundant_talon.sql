CREATE TABLE `slide_tag` (
	`slide_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`slide_id`) REFERENCES `slides`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `slide_tag_slide_id_idx` ON `slide_tag` (`slide_id`);--> statement-breakpoint
CREATE INDEX `slide_tag_tag_id_idx` ON `slide_tag` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `slide_tag_unique_idx` ON `slide_tag` (`slide_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `slides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`published` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slides_slug_idx` ON `slides` (`slug`);