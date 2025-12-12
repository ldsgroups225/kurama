CREATE TABLE "discount_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"discount_code" text NOT NULL,
	"order_id" text,
	"discount_amount" integer NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_usage_user_code_unique" UNIQUE("user_id","discount_code")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" text,
	"product_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text NOT NULL,
	"checkout_id" text,
	"billing_reason" text,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_user_id" text NOT NULL,
	"referred_user_id" text,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_amount" integer DEFAULT 300 NOT NULL,
	"completed_at" timestamp,
	"rewarded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"price_id" text,
	"status" text NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "subscription_tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "subscription_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "referred_by" text;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_auth_user_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_auth_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_discount_usage_user" ON "discount_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_subscription_id" ON "orders" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referrals_referrer" ON "referrals" USING btree ("referrer_user_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_code" ON "referrals" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_referral_code_unique" UNIQUE("referral_code");