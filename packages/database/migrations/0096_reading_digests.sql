CREATE TABLE `reading_digests` (
	`date` text PRIMARY KEY NOT NULL,
	`overview` text NOT NULL,
	`picks` text NOT NULL,
	`topics` text NOT NULL,
	`article_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
