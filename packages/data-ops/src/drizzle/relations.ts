import { relations } from "drizzle-orm/relations";
import { authUser, authAccount, authSession, lessons, cards, studySessions, grades, subjectOfferings, subjects, series, userProfiles, userProgress, userLessonMastery, levelSeries, subscriptions, orders, referrals, discountUsage } from "./schema";

export const authAccountRelations = relations(authAccount, ({ one }) => ({
	authUser: one(authUser, {
		fields: [authAccount.userId],
		references: [authUser.id]
	}),
}));

export const authUserRelations = relations(authUser, ({ many }) => ({
	authAccounts: many(authAccount),
	authSessions: many(authSession),
	studySessions: many(studySessions),
	userProfiles: many(userProfiles),
	userProgresses: many(userProgress),
	lessons: many(lessons),
	userLessonMasteries: many(userLessonMastery),
	subscriptions: many(subscriptions),
	orders: many(orders),
	referralsAsReferrer: many(referrals, { relationName: "referrer" }),
	referralsAsReferred: many(referrals, { relationName: "referred" }),
	discountUsages: many(discountUsage),
}));

export const authSessionRelations = relations(authSession, ({ one }) => ({
	authUser: one(authUser, {
		fields: [authSession.userId],
		references: [authUser.id]
	}),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
	lesson: one(lessons, {
		fields: [cards.lessonId],
		references: [lessons.id]
	}),
	userProgresses: many(userProgress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
	cards: many(cards),
	studySessions: many(studySessions),
	userProgresses: many(userProgress),
	subject: one(subjects, {
		fields: [lessons.subjectId],
		references: [subjects.id]
	}),
	authUser: one(authUser, {
		fields: [lessons.authorId],
		references: [authUser.id]
	}),
	userLessonMasteries: many(userLessonMastery),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
	authUser: one(authUser, {
		fields: [studySessions.userId],
		references: [authUser.id]
	}),
	lesson: one(lessons, {
		fields: [studySessions.lessonId],
		references: [lessons.id]
	}),
}));

export const subjectOfferingsRelations = relations(subjectOfferings, ({ one }) => ({
	grade: one(grades, {
		fields: [subjectOfferings.gradeId],
		references: [grades.id]
	}),
	subject: one(subjects, {
		fields: [subjectOfferings.subjectId],
		references: [subjects.id]
	}),
	series: one(series, {
		fields: [subjectOfferings.seriesId],
		references: [series.id]
	}),
}));

export const gradesRelations = relations(grades, ({ many }) => ({
	subjectOfferings: many(subjectOfferings),
	userProfiles: many(userProfiles),
	levelSeries: many(levelSeries),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
	subjectOfferings: many(subjectOfferings),
	lessons: many(lessons),
}));

export const seriesRelations = relations(series, ({ many }) => ({
	subjectOfferings: many(subjectOfferings),
	userProfiles: many(userProfiles),
	levelSeries: many(levelSeries),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	authUser: one(authUser, {
		fields: [userProfiles.userId],
		references: [authUser.id]
	}),
	grade: one(grades, {
		fields: [userProfiles.gradeId],
		references: [grades.id]
	}),
	series: one(series, {
		fields: [userProfiles.seriesId],
		references: [series.id]
	}),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
	authUser: one(authUser, {
		fields: [userProgress.userId],
		references: [authUser.id]
	}),
	card: one(cards, {
		fields: [userProgress.cardId],
		references: [cards.id]
	}),
	lesson: one(lessons, {
		fields: [userProgress.lessonId],
		references: [lessons.id]
	}),
}));

export const userLessonMasteryRelations = relations(userLessonMastery, ({ one }) => ({
	authUser: one(authUser, {
		fields: [userLessonMastery.userId],
		references: [authUser.id]
	}),
	lesson: one(lessons, {
		fields: [userLessonMastery.lessonId],
		references: [lessons.id]
	}),
}));

export const levelSeriesRelations = relations(levelSeries, ({ one }) => ({
	grade: one(grades, {
		fields: [levelSeries.gradeId],
		references: [grades.id]
	}),
	series: one(series, {
		fields: [levelSeries.seriesId],
		references: [series.id]
	}),
}));

// Payment & Subscription Relations
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
	user: one(authUser, {
		fields: [subscriptions.userId],
		references: [authUser.id]
	}),
	orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
	user: one(authUser, {
		fields: [orders.userId],
		references: [authUser.id]
	}),
	subscription: one(subscriptions, {
		fields: [orders.subscriptionId],
		references: [subscriptions.id]
	}),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
	referrer: one(authUser, {
		fields: [referrals.referrerUserId],
		references: [authUser.id],
		relationName: "referrer"
	}),
	referred: one(authUser, {
		fields: [referrals.referredUserId],
		references: [authUser.id],
		relationName: "referred"
	}),
}));

export const discountUsageRelations = relations(discountUsage, ({ one }) => ({
	user: one(authUser, {
		fields: [discountUsage.userId],
		references: [authUser.id]
	}),
	order: one(orders, {
		fields: [discountUsage.orderId],
		references: [orders.id]
	}),
}));
