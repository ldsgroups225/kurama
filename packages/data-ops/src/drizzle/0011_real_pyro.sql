CREATE TABLE "parent_alert_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"alert_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parent_alert_reads_unique" UNIQUE("parent_id","alert_id")
);
--> statement-breakpoint
ALTER TABLE "parent_alert_reads" ADD CONSTRAINT "parent_alert_reads_parent_id_auth_user_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_parent_alert_reads_parent_id" ON "parent_alert_reads" USING btree ("parent_id");