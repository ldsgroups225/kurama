ALTER TABLE "lessons" ADD COLUMN "teach_plan" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "teach_plan_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "teach_plan_metadata" json;