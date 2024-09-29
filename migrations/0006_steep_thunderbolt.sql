CREATE TABLE IF NOT EXISTS "blog_tag" (
	"blog_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_tag" ADD CONSTRAINT "blog_tag_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_tag" ADD CONSTRAINT "blog_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_tag_blog_id_index" ON "blog_tag" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_tag_tag_id_index" ON "blog_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tag_blog_id_tag_id_index" ON "blog_tag" USING btree ("blog_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_index" ON "tags" USING btree ("name");