ALTER TABLE `articles` ADD `updated_at` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `articles` SET `updated_at` = `created_at` WHERE `updated_at` = '';
