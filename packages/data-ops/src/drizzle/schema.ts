import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { auth_user } from "./auth-schema";

// ============================================================================
// EDUCATIONAL STRUCTURE TABLES
// ============================================================================

/**
 * Grades/Levels table (CP1, CP2, 6ème, 5ème, Tle, etc.)
 */
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  category: text("category").notNull(), // 'PRIMARY', 'COLLEGE', 'LYCEE'
  displayOrder: integer("display_order").notNull(),
});

/**
 * Series table (A, C, D, etc. for Lycée levels)
 */
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull(),
});

/**
 * Junction table: Which series are available for which grades
 */
export const levelSeries = pgTable(
  "level_series",
  {
    gradeId: integer("grade_id")
      .notNull()
      .references(() => grades.id, { onDelete: "cascade" }),
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gradeId, table.seriesId] }),
  })
);

/**
 * Subjects table (Mathématiques, Français, etc.)
 */
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  abbreviation: text("abbreviation").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull(),
});

/**
 * Subject offerings: Which subjects are available for which grade/series combinations
 */
export const subjectOfferings = pgTable("subject_offerings", {
  id: serial("id").primaryKey(),
  gradeId: integer("grade_id")
    .notNull()
    .references(() => grades.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  seriesId: integer("series_id").references(() => series.id, {
    onDelete: "cascade",
  }),
  isMandatory: boolean("is_mandatory").default(true).notNull(),
  coefficient: integer("coefficient").default(1),
});

// ============================================================================
// CONTENT TABLES
// ============================================================================

/**
 * Lessons table
 */
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  authorId: text("author_id").references(() => auth_user.id, {
    onDelete: "set null",
  }),
  difficulty: text("difficulty"), // 'easy', 'medium', 'hard'
  estimatedDuration: integer("estimated_duration"), // in minutes
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Flashcards table
 */
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  frontContent: text("front_content").notNull(),
  backContent: text("back_content").notNull(),
  cardType: text("card_type").default("basic").notNull(), // 'basic', 'cloze', 'multiple_choice'
  difficulty: integer("difficulty").default(0), // SM-2 algorithm difficulty
  displayOrder: integer("display_order").notNull(),
  metadata: json("metadata"), // Additional data like images, audio, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// USER PROFILE TABLES
// ============================================================================

/**
 * User profiles table - Extended user information
 */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  userType: text("user_type", { enum: ["student", "parent"] }).notNull(),

  // Basic Information (both student and parent)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),

  // Student-specific fields
  phone: text("phone"),
  age: integer("age"),
  gender: text("gender", { enum: ["male", "female"] }),
  city: text("city"),
  idNumber: text("id_number"), // Student matricule
  gradeId: integer("grade_id").references(() => grades.id, {
    onDelete: "set null",
  }),
  seriesId: integer("series_id").references(() => series.id, {
    onDelete: "set null",
  }),
  favoriteSubjects: json("favorite_subjects").$type<string[]>(), // Array of subject names
  learningGoals: text("learning_goals"),
  studyTime: text("study_time"), // Daily study time preference

  // Parent-specific fields
  childrenMatricules: json("children_matricules").$type<number[]>(), // Array of student matricules

  // Common fields
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// PROGRESS TRACKING TABLES
// ============================================================================

/**
 * User progress on cards (SM-2 spaced repetition)
 */
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  easeFactor: integer("ease_factor").default(2500).notNull(), // SM-2: 2.5 * 1000
  interval: integer("interval").default(0).notNull(), // Days until next review
  repetitions: integer("repetitions").default(0).notNull(),
  lastReviewedAt: timestamp("last_reviewed_at"),
  nextReviewAt: timestamp("next_review_at"),
  totalReviews: integer("total_reviews").default(0).notNull(),
  correctReviews: integer("correct_reviews").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Study sessions tracking
 */
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  cardsReviewed: integer("cards_reviewed").default(0).notNull(),
  cardsCorrect: integer("cards_correct").default(0).notNull(),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const gradesRelations = relations(grades, ({ many }) => ({
  levelSeries: many(levelSeries),
  subjectOfferings: many(subjectOfferings),
  userProfiles: many(userProfiles),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  levelSeries: many(levelSeries),
  subjectOfferings: many(subjectOfferings),
  userProfiles: many(userProfiles),
}));

export const levelSeriesRelations = relations(levelSeries, ({ one }) => ({
  grade: one(grades, {
    fields: [levelSeries.gradeId],
    references: [grades.id],
  }),
  series: one(series, {
    fields: [levelSeries.seriesId],
    references: [series.id],
  }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  subjectOfferings: many(subjectOfferings),
  lessons: many(lessons),
}));

export const subjectOfferingsRelations = relations(
  subjectOfferings,
  ({ one }) => ({
    grade: one(grades, {
      fields: [subjectOfferings.gradeId],
      references: [grades.id],
    }),
    subject: one(subjects, {
      fields: [subjectOfferings.subjectId],
      references: [subjects.id],
    }),
    series: one(series, {
      fields: [subjectOfferings.seriesId],
      references: [series.id],
    }),
  })
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [lessons.subjectId],
    references: [subjects.id],
  }),
  author: one(auth_user, {
    fields: [lessons.authorId],
    references: [auth_user.id],
  }),
  cards: many(cards),
  userProgress: many(userProgress),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [cards.lessonId],
    references: [lessons.id],
  }),
  userProgress: many(userProgress),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(auth_user, {
    fields: [userProfiles.userId],
    references: [auth_user.id],
  }),
  grade: one(grades, {
    fields: [userProfiles.gradeId],
    references: [grades.id],
  }),
  series: one(series, {
    fields: [userProfiles.seriesId],
    references: [series.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(auth_user, {
    fields: [userProgress.userId],
    references: [auth_user.id],
  }),
  card: one(cards, {
    fields: [userProgress.cardId],
    references: [cards.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(auth_user, {
    fields: [studySessions.userId],
    references: [auth_user.id],
  }),
  lesson: one(lessons, {
    fields: [studySessions.lessonId],
    references: [lessons.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SelectGrade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;

export type SelectSeries = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

export type SelectLevelSeries = typeof levelSeries.$inferSelect;
export type InsertLevelSeries = typeof levelSeries.$inferInsert;

export type SelectSubject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

export type SelectSubjectOffering = typeof subjectOfferings.$inferSelect;
export type InsertSubjectOffering = typeof subjectOfferings.$inferInsert;

export type SelectLesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export type SelectCard = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

export type SelectUserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type SelectUserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export type SelectStudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = typeof studySessions.$inferInsert;
