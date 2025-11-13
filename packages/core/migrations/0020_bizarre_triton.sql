CREATE TABLE "blog_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_id" integer NOT NULL,
	"feedback_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_feedback" ADD CONSTRAINT "blog_feedback_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_feedback" ADD CONSTRAINT "blog_feedback_feedback_id_feedbacks_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedbacks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_feedback_blog_id_index" ON "blog_feedback" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "blog_feedback_feedback_id_index" ON "blog_feedback" USING btree ("feedback_id");

INSERT INTO "feedbacks" ("id", "name") VALUES (1, 'good'), (2, 'bad'), (3, 'informative'), (4, 'shallow'), (5, 'interesting'), (6, 'boring'), (7, 'easy'), (8, 'difficult');
