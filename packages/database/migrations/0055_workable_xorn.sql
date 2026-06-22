CREATE TABLE `blog_view_dailies` (
	`blog_id` integer NOT NULL,
	`date` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`blog_id`, `date`),
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blog_view_dailies_date_idx` ON `blog_view_dailies` (`date`);