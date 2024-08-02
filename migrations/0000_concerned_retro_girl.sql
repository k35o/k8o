CREATE TABLE IF NOT EXISTS "quiz_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"answer" text NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"question" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_type_quiz_type_id_fk" FOREIGN KEY ("type") REFERENCES "public"."quiz_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_answers_quiz_id_index" ON "quiz_answers" USING btree ("quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quiz_questions_quiz_id_index" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quiz_type_name_index" ON "quiz_type" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quizzes_type_index" ON "quizzes" USING btree ("type");