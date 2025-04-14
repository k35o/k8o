ALTER TABLE "inquiry" RENAME TO "comments";--> statement-breakpoint
DROP INDEX "inquiry_id_index";--> statement-breakpoint
CREATE INDEX "comments_id_index" ON "comments" USING btree ("id");