ALTER TABLE "blogs" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;