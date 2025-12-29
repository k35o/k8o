CREATE TABLE `blog_comment` (
	`blog_id` integer NOT NULL,
	`commend_id` integer NOT NULL,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`commend_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blog_comment_blog_id_idx` ON `blog_comment` (`blog_id`);--> statement-breakpoint
CREATE INDEX `blog_comment_comment_id_idx` ON `blog_comment` (`commend_id`);--> statement-breakpoint
CREATE TABLE `blog_tag` (
	`blog_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blog_tag_blog_id_idx` ON `blog_tag` (`blog_id`);--> statement-breakpoint
CREATE INDEX `blog_tag_tag_id_idx` ON `blog_tag` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `blog_tag_unique_idx` ON `blog_tag` (`blog_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `blog_views` (
	`blog_id` integer PRIMARY KEY NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blog_views_blog_id_idx` ON `blog_views` (`blog_id`);--> statement-breakpoint
CREATE TABLE `blogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`published` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blogs_slug_idx` ON `blogs` (`slug`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text,
	`sent_at` text,
	`feedback_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`feedback_id`) REFERENCES `feedbacks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_id_idx` ON `comments` (`id`);--> statement-breakpoint
CREATE INDEX `comments_feedback_id_idx` ON `comments` (`feedback_id`);--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`answer` text NOT NULL,
	`explanation` text,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quiz_answers_quiz_id_idx` ON `quiz_answers` (`quiz_id`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`highlight` text,
	`question` text NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_questions_quiz_id_idx` ON `quiz_questions` (`quiz_id`);--> statement-breakpoint
CREATE TABLE `quiz_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_type_name_idx` ON `quiz_type` (`name`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` integer NOT NULL,
	FOREIGN KEY (`type`) REFERENCES `quiz_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quizzes_type_idx` ON `quizzes` (`type`);--> statement-breakpoint
CREATE TABLE `service_tag` (
	`service_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `service_tag_service_id_idx` ON `service_tag` (`service_id`);--> statement-breakpoint
CREATE INDEX `service_tag_tag_id_idx` ON `service_tag` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `service_tag_unique_idx` ON `service_tag` (`service_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `service_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_type_name_idx` ON `service_type` (`name`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` integer NOT NULL,
	FOREIGN KEY (`type`) REFERENCES `service_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_idx` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `services_id_idx` ON `services` (`id`);--> statement-breakpoint
CREATE INDEX `services_type_idx` ON `services` (`type`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`verification_token` text,
	`token_expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `subscribers_id_idx` ON `subscribers` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_idx` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `talk_tag` (
	`talk_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`talk_id`) REFERENCES `talks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `talk_tag_talk_id_idx` ON `talk_tag` (`talk_id`);--> statement-breakpoint
CREATE INDEX `talk_tag_tag_id_idx` ON `talk_tag` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `talk_tag_unique_idx` ON `talk_tag` (`talk_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `talks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`event_url` text NOT NULL,
	`event_name` text NOT NULL,
	`event_date` text NOT NULL,
	`event_location` text,
	`slide_url` text NOT NULL,
	`blog_id` integer NOT NULL,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `talks_id_idx` ON `talks` (`id`);--> statement-breakpoint
CREATE INDEX `talks_blog_id_idx` ON `talks` (`blog_id`);