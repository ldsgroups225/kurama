import { z } from "zod";

// Base Card Schema
export const baseCardSchema = z.object({
  id: z.number().optional(),
  lessonId: z.number(),
  frontContent: z.string(),
  backContent: z.string(),
  cardType: z.enum(['basic', 'multichoice', 'true_false', 'fill_blank', 'matching', 'ordering']).default('basic'),
  difficulty: z.number().default(0),
  displayOrder: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),

  // Gamification
  timeLimit: z.number().optional(),
  points: z.number().default(10),

  // Common Content Fields
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

// Multiple Choice Specifics
export const multipleChoiceOptionsSchema = z.array(z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
}));

export const multipleChoiceCardSchema = baseCardSchema.extend({
  cardType: z.literal('multichoice'),
  question: z.string().optional(), // Can override frontContent
  options: multipleChoiceOptionsSchema,
});

// True/False Specifics
export const trueFalseCardSchema = baseCardSchema.extend({
  cardType: z.literal('true_false'),
  correctAnswer: z.enum(['true', 'false']),
});

// Fill in Blank Specifics
export const fillBlankCardSchema = baseCardSchema.extend({
  cardType: z.literal('fill_blank'),
  correctAnswer: z.string(), // The exact word/phrase to match
  options: z.array(z.string()).optional(), // Optional bank of words
});

// Union Schema for API
export const cardSchema = z.discriminatedUnion('cardType', [
  baseCardSchema.extend({ cardType: z.literal('basic') }),
  multipleChoiceCardSchema,
  trueFalseCardSchema,
  fillBlankCardSchema,
]);

export type Card = z.infer<typeof cardSchema>;
export type MultipleChoiceCard = z.infer<typeof multipleChoiceCardSchema>;
