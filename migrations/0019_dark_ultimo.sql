DROP INDEX "blogs_title_index";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "updated_at";