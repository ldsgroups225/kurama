CREATE TABLE "lessons_content_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"page_number" integer,
	"embedding" vector(768),
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "total_chunks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "lessons_content_file" ADD COLUMN "extracted_text" text;--> statement-breakpoint
ALTER TABLE "lessons_content_chunks" ADD CONSTRAINT "lessons_content_chunks_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."lessons_content_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lessons_content_chunks_file_id" ON "lessons_content_chunks" USING btree ("file_id");--> statement-breakpoint
ALTER TABLE "lessons_content_file" DROP COLUMN "chunk_text";--> statement-breakpoint
ALTER TABLE "lessons_content_file" DROP COLUMN "chunk_index";--> statement-breakpoint
ALTER TABLE "lessons_content_file" DROP COLUMN "page_number";--> statement-breakpoint
ALTER TABLE "lessons_content_file" DROP COLUMN "embedding";--> statement-breakpoint
ALTER TABLE "lessons_content_file" DROP COLUMN "metadata";