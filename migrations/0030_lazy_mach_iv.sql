CREATE TABLE "service_tag" (
	"service_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_tag" ADD CONSTRAINT "service_tag_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tag" ADD CONSTRAINT "service_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_type_service_type_id_fk" FOREIGN KEY ("type") REFERENCES "public"."service_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "service_tag_service_id_index" ON "service_tag" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_tag_tag_id_index" ON "service_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_tag_service_id_tag_id_index" ON "service_tag" USING btree ("service_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_type_name_index" ON "service_type" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_index" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_id_index" ON "services" USING btree ("id");--> statement-breakpoint
CREATE INDEX "services_type_index" ON "services" USING btree ("type");