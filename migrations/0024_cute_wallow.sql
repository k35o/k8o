CREATE TABLE "blog_comment" (
	"blog_id" integer NOT NULL,
	"commend_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_feedback" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "blog_feedback" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "feedback_id" integer;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_commend_id_comments_id_fk" FOREIGN KEY ("commend_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_comment_blog_id_index" ON "blog_comment" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "blog_comment_commend_id_index" ON "blog_comment" USING btree ("commend_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_feedback_id_feedbacks_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedbacks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_feedback_id_index" ON "comments" USING btree ("feedback_id");