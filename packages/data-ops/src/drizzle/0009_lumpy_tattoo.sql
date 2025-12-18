ALTER TABLE "user_profiles" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "streak_freeze_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "last_streak_freeze_used_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_study_sessions_user_started" ON "study_sessions" USING btree ("user_id","started_at");