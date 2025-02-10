CREATE TABLE "test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "test_name_index" ON "test" USING btree ("name");