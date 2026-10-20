CREATE TABLE `ai_artifact_shares` (
	`artifact_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`version_id` integer NOT NULL,
	FOREIGN KEY (`artifact_id`) REFERENCES `ai_artifacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`version_id`) REFERENCES `ai_artifact_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_artifact_shares_slug_unique` ON `ai_artifact_shares` (`slug`);