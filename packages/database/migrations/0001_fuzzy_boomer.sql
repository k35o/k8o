ALTER TABLE "quiz_answers" ALTER COLUMN "quiz_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "quiz_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "type" SET NOT NULL;