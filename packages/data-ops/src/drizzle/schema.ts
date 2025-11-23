import { pgTable, text, timestamp, unique, boolean, foreignKey, serial, integer, json, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
	isCompleted: boolean("is_completed").default(false).notNull(),
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

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
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
}, (table) => [
	foreignKey({
		columns: [table.subjectId],
		foreignColumns: [subjects.id],
		name: "lessons_subject_id_subjects_id_fk"
	}).onDelete("cascade"),
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

// Insert types
export type InsertGrade = typeof grades.$inferInsert;
export type InsertSeries = typeof series.$inferInsert;
export type InsertSubject = typeof subjects.$inferInsert;
export type InsertLevelSeries = typeof levelSeries.$inferInsert;
export type InsertSubjectOffering = typeof subjectOfferings.$inferInsert;
export type InsertLesson = typeof lessons.$inferInsert;
export type InsertCard = typeof cards.$inferInsert;

// Select types
export type SelectUserProfile = typeof userProfiles.$inferSelect;
export type SelectGrade = typeof grades.$inferSelect;
export type SelectSeries = typeof series.$inferSelect;

// Complex types with relations
export type UserProfileWithRelations = SelectUserProfile & {
	grade: SelectGrade | null;
	series: SelectSeries | null;
};
