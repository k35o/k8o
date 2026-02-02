ALTER TABLE `comments` ADD COLUMN `processing_at` text;

CREATE INDEX `comments_processing_at_idx` ON `comments` (`processing_at`);
