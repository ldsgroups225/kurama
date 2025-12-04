ALTER TABLE "lessons" ADD COLUMN "grade_id" integer;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "series_id" integer;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;