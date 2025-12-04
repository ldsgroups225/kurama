import { z } from 'zod'

// Subject schemas
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  abbreviation: z.string().min(1, 'L\'abréviation est requise').max(10, 'L\'abréviation doit faire moins de 10 caractères'),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
})

export const updateSubjectSchema = createSubjectSchema.extend({
  id: z.number().int().positive(),
})

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>

// Lesson schemas
export const createLessonSchema = z.object({
  subjectId: z.number().int().positive('La matière est requise'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  estimatedDuration: z.number().int().min(1).optional(),
  isPublished: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
})

export const updateLessonSchema = createLessonSchema.extend({
  id: z.number().int().positive(),
})

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>

// Filter schemas
export const subjectFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const lessonFiltersSchema = z.object({
  subjectId: z.number().int().positive().optional(),
  isPublished: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type SubjectFilters = z.infer<typeof subjectFiltersSchema>
export type LessonFilters = z.infer<typeof lessonFiltersSchema>

// Card schemas
const cardOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Le texte de l\'option est requis'),
  isCorrect: z.boolean(),
})

export const createCardSchema = z.object({
  lessonId: z.number().int().positive('La leçon est requise'),
  cardType: z.enum(['basic', 'multichoice', 'true_false', 'fill_blank']).default('basic'),
  frontContent: z.string().min(1, 'Le contenu recto est requis'),
  backContent: z.string().min(1, 'Le contenu verso est requis'),
  question: z.string().optional(),
  options: z.array(cardOptionSchema).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  timeLimit: z.number().int().min(1).optional(),
  points: z.number().int().min(1).default(10),
  difficulty: z.number().int().min(0).max(5).default(0),
  displayOrder: z.number().int().min(0).default(0),
})

export const updateCardSchema = createCardSchema.extend({
  id: z.number().int().positive(),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type CardOption = z.infer<typeof cardOptionSchema>

export const cardFiltersSchema = z.object({
  lessonId: z.number().int().positive().optional(),
  cardType: z.enum(['basic', 'multichoice', 'true_false', 'fill_blank']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type CardFilters = z.infer<typeof cardFiltersSchema>
