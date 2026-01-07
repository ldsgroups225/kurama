import { pgTable, text, timestamp, unique, boolean, foreignKey, serial, integer, json, primaryKey, customType, index } from "drizzle-orm/pg-core"

// Custom type for pgvector
const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
	dataType(config) {
		return config?.dimensions ? `vector(${config.dimensions})` : 'vector'
	},
	toDriver(value: number[]): string {
		return `[${value.join(',')}]`
	},
	fromDriver(value: string): number[] {
		return value
			.slice(1, -1)
			.split(',')
			.map((v) => parseFloat(v))
	},
})



export const authVerification = pgTable("auth_verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const authUser = pgTable("auth_user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("auth_user_email_unique").on(table.email),
]);

export const authAccount = pgTable("auth_account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "auth_account_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
]);

export const authSession = pgTable("auth_session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "auth_session_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	unique("auth_session_token_unique").on(table.token),
]);

export const cards = pgTable("cards", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id").notNull(),
	frontContent: text("front_content").notNull(),
	backContent: text("back_content").notNull(),
	cardType: text("card_type").default('basic').notNull(),
	question: text("question"),
	options: json("options").$type<{ id: string; text: string; isCorrect: boolean }[]>(),
	correctAnswer: text("correct_answer"),
	explanation: text("explanation"),
	hints: json("hints").$type<string[]>(),
	timeLimit: integer("time_limit"),
	points: integer("points").default(10),
	difficulty: integer().default(0),
	displayOrder: integer("display_order").notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "cards_lesson_id_lessons_id_fk"
	}).onDelete("cascade"),
]);

export const learningModeConfigs = pgTable("learning_mode_configs", {
	id: serial().primaryKey().notNull(),
	modeName: text("mode_name").unique().notNull(),
	supportedTypes: json("supported_types").$type<string[]>(),
	settings: json("settings"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	abbreviation: text().notNull(),
	description: text(),
	displayOrder: integer("display_order").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
}, (table) => [
	unique("subjects_name_unique").on(table.name),
	unique("subjects_abbreviation_unique").on(table.abbreviation),
]);

export const grades = pgTable("grades", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	category: text().notNull(),
	displayOrder: integer("display_order").notNull(),
}, (table) => [
	unique("grades_name_unique").on(table.name),
	unique("grades_slug_unique").on(table.slug),
]);

export const series = pgTable("series", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	displayOrder: integer("display_order").notNull(),
}, (table) => [
	unique("series_name_unique").on(table.name),
]);

export const studySessions = pgTable("study_sessions", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	mode: text("mode").notNull(), // Added mode column
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	cardsReviewed: integer("cards_reviewed").default(0).notNull(),
	cardsCorrect: integer("cards_correct").default(0).notNull(),
	duration: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "study_sessions_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "study_sessions_lesson_id_lessons_id_fk"
	}).onDelete("cascade"),
	// Index for streak calculation performance
	index("idx_study_sessions_user_started").on(table.userId, table.startedAt),
]);

export const subjectOfferings = pgTable("subject_offerings", {
	id: serial().primaryKey().notNull(),
	gradeId: integer("grade_id").notNull(),
	subjectId: integer("subject_id").notNull(),
	seriesId: integer("series_id"),
	isMandatory: boolean("is_mandatory").default(true).notNull(),
	coefficient: integer().default(1),
}, (table) => [
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "subject_offerings_grade_id_grades_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.subjectId],
		foreignColumns: [subjects.id],
		name: "subject_offerings_subject_id_subjects_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "subject_offerings_series_id_series_id_fk"
	}).onDelete("cascade"),
]);

export const userProfiles = pgTable("user_profiles", {
	userId: text("user_id").primaryKey().notNull(),
	userType: text("user_type").$type<'student' | 'parent'>().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	phone: text(),
	age: integer(),
	gender: text().$type<'male' | 'female'>(),
	city: text(),
	idNumber: text("id_number"),
	gradeId: integer("grade_id"),
	seriesId: integer("series_id"),
	favoriteSubjects: json("favorite_subjects").$type<string[]>(),
	learningGoals: text("learning_goals"),
	studyTime: text("study_time"),
	childrenMatricules: json("children_matricules").$type<string[]>(),
	xp: integer("xp").default(0).notNull(),
	// Streak persistence fields
	longestStreak: integer("longest_streak").default(0).notNull(),
	streakFreezeCount: integer("streak_freeze_count").default(0).notNull(), // Premium feature
	lastStreakFreezeUsedAt: timestamp("last_streak_freeze_used_at", { mode: 'string' }),
	isCompleted: boolean("is_completed").default(false).notNull(),
	// Subscription fields
	subscriptionTier: text("subscription_tier").$type<'free' | 'monthly' | 'quarterly' | 'annual'>().default('free').notNull(),
	subscriptionExpiresAt: timestamp("subscription_expires_at", { mode: 'string' }),
	referralCode: text("referral_code"),
	referredBy: text("referred_by"), // Referral code used at signup
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "user_profiles_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "user_profiles_grade_id_grades_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "user_profiles_series_id_series_id_fk"
	}).onDelete("set null"),
	unique("user_profiles_referral_code_unique").on(table.referralCode),
]);

export const userProgress = pgTable("user_progress", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	cardId: integer("card_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	easeFactor: integer("ease_factor").default(2500).notNull(),
	interval: integer().default(0).notNull(),
	repetitions: integer().default(0).notNull(),
	lastReviewedAt: timestamp("last_reviewed_at", { mode: 'string' }),
	nextReviewAt: timestamp("next_review_at", { mode: 'string' }),
	totalReviews: integer("total_reviews").default(0).notNull(),
	correctReviews: integer("correct_reviews").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "user_progress_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.cardId],
		foreignColumns: [cards.id],
		name: "user_progress_card_id_cards_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "user_progress_lesson_id_lessons_id_fk"
	}).onDelete("cascade"),
]);

// Type for teach plan metadata
export type LessonTeachPlanMetadata = {
	country?: string
	grade?: string
	language?: string
	sources?: { uri: string; title: string }[]
	generatedBy?: string
}

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
	gradeId: integer("grade_id"), // Grade this lesson is for (nullable for legacy data)
	seriesId: integer("series_id"), // Series this lesson is for (nullable, only for Lycée)
	title: text().notNull(),
	description: text(),
	authorId: text("author_id"),
	difficulty: text(),
	estimatedDuration: integer("estimated_duration"),
	isPublished: boolean("is_published").default(false).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	displayOrder: integer("display_order").default(0).notNull(),
	// AI-generated teach plan fields
	teachPlan: text("teach_plan"),
	teachPlanGeneratedAt: timestamp("teach_plan_generated_at", { mode: 'string' }),
	teachPlanMetadata: json("teach_plan_metadata").$type<LessonTeachPlanMetadata>(),
}, (table) => [
	foreignKey({
		columns: [table.subjectId],
		foreignColumns: [subjects.id],
		name: "lessons_subject_id_subjects_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "lessons_grade_id_grades_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "lessons_series_id_series_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [authUser.id],
		name: "lessons_author_id_auth_user_id_fk"
	}).onDelete("set null"),
]);

export const userLessonMastery = pgTable("user_lesson_mastery", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	successfulTestCount: integer("successful_test_count").default(0).notNull(),
	lastTestScore: integer("last_test_score"),
	lastTestAt: timestamp("last_test_at", { mode: 'string' }),
	isUnlocked: boolean("is_unlocked").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "user_lesson_mastery_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "user_lesson_mastery_lesson_id_lessons_id_fk"
	}).onDelete("cascade"),
	unique("user_lesson_mastery_user_id_lesson_id_unique").on(table.userId, table.lessonId),
]);

export const userAchievements = pgTable("user_achievements", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	achievementId: text("achievement_id").notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
	notified: boolean("notified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "user_achievements_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	unique("user_achievements_user_achievement_unique").on(table.userId, table.achievementId),
	index("idx_user_achievements_user_id").on(table.userId),
	index("idx_user_achievements_unlocked_at").on(table.unlockedAt),
]);

export const levelSeries = pgTable("level_series", {
	gradeId: integer("grade_id").notNull(),
	seriesId: integer("series_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "level_series_grade_id_grades_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "level_series_series_id_series_id_fk"
	}).onDelete("cascade"),
	primaryKey({ columns: [table.gradeId, table.seriesId], name: "level_series_grade_id_series_id_pk" }),
]);

// Lesson content files - Parent table for uploaded attachments
export const lessonsContentFile = pgTable("lessons_content_file", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id"), // Nullable for subject-wide files
	fileUrl: text("file_url").notNull(),
	fileName: text("file_name").notNull(),
	fileTitle: text("file_title"), // User-provided title
	fileType: text("file_type").default('pdf').notNull(),
	fileSize: integer("file_size"), // Size in bytes
	hasEmbeddings: boolean("has_embeddings").default(false).notNull(),
	totalChunks: integer("total_chunks").default(0),
	extractedText: text("extracted_text"), // Full extracted text for reference
	// Subject-wide attachment fields
	isSubjectWide: boolean("is_subject_wide").default(false).notNull(),
	subjectId: integer("subject_id"), // For subject-wide files
	gradeId: integer("grade_id"), // For subject-wide files (scope)
	seriesId: integer("series_id"), // For subject-wide files (scope, nullable)
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "lessons_content_file_lesson_id_lessons_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.subjectId],
		foreignColumns: [subjects.id],
		name: "lessons_content_file_subject_id_subjects_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "lessons_content_file_grade_id_grades_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "lessons_content_file_series_id_series_id_fk"
	}).onDelete("set null"),
	index("idx_lessons_content_lesson_id").on(table.lessonId),
	index("idx_lessons_content_subject_wide").on(table.isSubjectWide, table.subjectId, table.gradeId),
	index("idx_lessons_content_created_at").on(table.createdAt),
]);

// Lesson content chunks - Child table for embedding vectors (RAG)
export const lessonsContentChunks = pgTable("lessons_content_chunks", {
	id: serial().primaryKey().notNull(),
	fileId: integer("file_id").notNull(),
	chunkText: text("chunk_text").notNull(),
	chunkIndex: integer("chunk_index").notNull(),
	pageNumber: integer("page_number"),
	embedding: vector("embedding", { dimensions: 768 }),
	metadata: json("metadata").$type<Record<string, unknown>>().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.fileId],
		foreignColumns: [lessonsContentFile.id],
		name: "lessons_content_chunks_file_id_fk"
	}).onDelete("cascade"),
	index("idx_lessons_content_chunks_file_id").on(table.fileId),
]);

// ============================================
// PAYMENT & SUBSCRIPTION TABLES (Polar SDK)
// ============================================

// Subscription status type
export type SubscriptionStatus =
	| 'incomplete'
	| 'incomplete_expired'
	| 'trialing'
	| 'active'
	| 'past_due'
	| 'canceled'
	| 'unpaid'
	| 'paused';

// Subscription tier type
export type SubscriptionTier = 'free' | 'monthly' | 'quarterly' | 'annual';

// Order status type
export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Billing reason type
export type BillingReason =
	| 'purchase'
	| 'subscription_create'
	| 'subscription_cycle'
	| 'subscription_update';

// Referral status type
export type ReferralStatus = 'pending' | 'completed' | 'expired' | 'rewarded';

// Subscriptions table - Track active subscriptions
export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey().notNull(), // Polar subscription ID
	userId: text("user_id").notNull(),
	productId: text("product_id").notNull(),
	priceId: text("price_id"),
	status: text("status").$type<SubscriptionStatus>().notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	canceledAt: timestamp("canceled_at", { mode: 'string' }),
	trialStart: timestamp("trial_start", { mode: 'string' }),
	trialEnd: timestamp("trial_end", { mode: 'string' }),
	metadata: json("metadata").$type<Record<string, string | number | boolean | null>>(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "subscriptions_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	index("idx_subscriptions_user_id").on(table.userId),
	index("idx_subscriptions_status").on(table.status),
]);

// Orders table - Track all payment transactions
export const orders = pgTable("orders", {
	id: text("id").primaryKey().notNull(), // Polar order ID
	userId: text("user_id").notNull(),
	subscriptionId: text("subscription_id"),
	productId: text("product_id").notNull(),
	amount: integer("amount").notNull(), // In cents
	currency: text("currency").default("usd").notNull(),
	status: text("status").$type<OrderStatus>().notNull(),
	checkoutId: text("checkout_id"),
	billingReason: text("billing_reason").$type<BillingReason>(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	refundedAt: timestamp("refunded_at", { mode: 'string' }),
	metadata: json("metadata").$type<Record<string, string | number | boolean | null>>(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "orders_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [subscriptions.id],
		name: "orders_subscription_id_subscriptions_id_fk"
	}).onDelete("set null"),
	index("idx_orders_user_id").on(table.userId),
	index("idx_orders_subscription_id").on(table.subscriptionId),
	index("idx_orders_status").on(table.status),
]);

// Referrals table - Track referral program
export const referrals = pgTable("referrals", {
	id: serial("id").primaryKey().notNull(),
	referrerUserId: text("referrer_user_id").notNull(),
	referredUserId: text("referred_user_id"),
	referralCode: text("referral_code").notNull(),
	status: text("status").$type<ReferralStatus>().default('pending').notNull(),
	rewardAmount: integer("reward_amount").default(300).notNull(), // $3.00 in cents
	completedAt: timestamp("completed_at", { mode: 'string' }),
	rewardedAt: timestamp("rewarded_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.referrerUserId],
		foreignColumns: [authUser.id],
		name: "referrals_referrer_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.referredUserId],
		foreignColumns: [authUser.id],
		name: "referrals_referred_user_id_auth_user_id_fk"
	}).onDelete("set null"),
	index("idx_referrals_referrer").on(table.referrerUserId),
	index("idx_referrals_code").on(table.referralCode),
	unique("referrals_referral_code_unique").on(table.referralCode),
]);

// Discount usage table - Track coupon usage
export const discountUsage = pgTable("discount_usage", {
	id: serial("id").primaryKey().notNull(),
	userId: text("user_id").notNull(),
	discountCode: text("discount_code").notNull(),
	orderId: text("order_id"),
	discountAmount: integer("discount_amount").notNull(), // In cents
	usedAt: timestamp("used_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [authUser.id],
		name: "discount_usage_user_id_auth_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "discount_usage_order_id_orders_id_fk"
	}).onDelete("set null"),
	index("idx_discount_usage_user").on(table.userId),
	unique("discount_usage_user_code_unique").on(table.userId, table.discountCode),
]);

// Insert types
export type InsertGrade = typeof grades.$inferInsert;
export type InsertSeries = typeof series.$inferInsert;
export type InsertSubject = typeof subjects.$inferInsert;
export type InsertLevelSeries = typeof levelSeries.$inferInsert;
export type InsertSubjectOffering = typeof subjectOfferings.$inferInsert;
export type InsertLesson = typeof lessons.$inferInsert;
export type InsertCard = typeof cards.$inferInsert;
export type InsertLessonsContentFile = typeof lessonsContentFile.$inferInsert;
export type InsertLessonsContentChunk = typeof lessonsContentChunks.$inferInsert;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertReferral = typeof referrals.$inferInsert;
export type InsertDiscountUsage = typeof discountUsage.$inferInsert;

// Select types
export type SelectUserProfile = typeof userProfiles.$inferSelect;
export type SelectGrade = typeof grades.$inferSelect;
export type SelectSeries = typeof series.$inferSelect;
export type SelectLessonsContentFile = typeof lessonsContentFile.$inferSelect;
export type SelectLessonsContentChunk = typeof lessonsContentChunks.$inferSelect;
export type SelectUserAchievement = typeof userAchievements.$inferSelect;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type SelectOrder = typeof orders.$inferSelect;
export type SelectReferral = typeof referrals.$inferSelect;
export type SelectDiscountUsage = typeof discountUsage.$inferSelect;

// Complex types with relations
export type UserProfileWithRelations = SelectUserProfile & {
	grade: SelectGrade | null;
	series: SelectSeries | null;
};

// Subscription with user info
export type SubscriptionWithUser = SelectSubscription & {
	user?: { id: string; email: string; name: string } | null;
};
