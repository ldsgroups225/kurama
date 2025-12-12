ALTER TABLE "lessons_content_file" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "is_subject_wide" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "subject_id" integer;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "grade_id" integer;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "series_id" integer;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD CONSTRAINT "lessons_content_file_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD CONSTRAINT "lessons_content_file_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD CONSTRAINT "lessons_content_file_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lessons_content_subject_wide" ON "lessons_content_file" USING btree ("is_subject_wide","subject_id","grade_id");