CREATE TABLE IF NOT EXISTS "blog_views" (
	"blog_id" integer PRIMARY KEY NOT NULL,
	"views" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_views_blog_id_index" ON "blog_views" USING btree ("blog_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blogs_title_index" ON "blogs" USING btree ("title");