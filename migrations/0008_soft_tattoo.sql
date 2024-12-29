CREATE TABLE "inquiry" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "inquiry_id_index" ON "inquiry" USING btree ("id");