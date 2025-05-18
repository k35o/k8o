CREATE TABLE "talk_tag" (
	"talk_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"event_url" text NOT NULL,
	"event_name" text NOT NULL,
	"event_date" date NOT NULL,
	"event_location" text,
	"slide_url" text NOT NULL,
	"blog_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "talk_tag" ADD CONSTRAINT "talk_tag_talk_id_talks_id_fk" FOREIGN KEY ("talk_id") REFERENCES "public"."talks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talk_tag" ADD CONSTRAINT "talk_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talks" ADD CONSTRAINT "talks_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "talk_tag_talk_id_index" ON "talk_tag" USING btree ("talk_id");--> statement-breakpoint
CREATE INDEX "talk_tag_tag_id_index" ON "talk_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "talk_tag_talk_id_tag_id_index" ON "talk_tag" USING btree ("talk_id","tag_id");--> statement-breakpoint
CREATE INDEX "talks_id_index" ON "talks" USING btree ("id");--> statement-breakpoint
CREATE INDEX "talks_blog_id_index" ON "talks" USING btree ("blog_id");