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
