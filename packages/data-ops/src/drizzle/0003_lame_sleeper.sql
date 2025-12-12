CREATE TABLE "lessons_content_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_title" text,
	"file_type" text DEFAULT 'pdf' NOT NULL,
	"file_size" integer,
	"chunk_text" text,
	"chunk_index" integer,
	"page_number" integer,
	"embedding" vector(1536),
	"metadata" json DEFAULT '{}'::json,
	"has_embeddings" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD CONSTRAINT "lessons_content_file_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lessons_content_lesson_id" ON "lessons_content_file" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_content_created_at" ON "lessons_content_file" USING btree ("created_at");