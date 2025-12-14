import { describe, expect, test } from 'vitest'
import {
  cardFiltersSchema,
  createCardSchema,
  createLessonSchema,
  createSubjectSchema,
  lessonFiltersSchema,
  subjectFiltersSchema,
  updateSubjectSchema,
  userFiltersSchema,
} from './schemas'

describe('subject Schemas', () => {
  describe('createSubjectSchema', () => {
    test('should validate a valid subject', () => {
      const validSubject = {
        name: 'Mathématiques',
        abbreviation: 'MATH',
        description: 'Cours de mathématiques',
        displayOrder: 1,
      }
      const result = createSubjectSchema.safeParse(validSubject)
      expect(result.success).toBe(true)
    })

    test('should reject empty name', () => {
      const invalidSubject = {
        name: '',
        abbreviation: 'MATH',
      }
      const result = createSubjectSchema.safeParse(invalidSubject)
      expect(result.success).toBe(false)
    })

    test('should reject abbreviation longer than 10 characters', () => {
      const invalidSubject = {
        name: 'Mathématiques',
        abbreviation: 'MATHEMATICS',
      }
      const result = createSubjectSchema.safeParse(invalidSubject)
      expect(result.success).toBe(false)
    })
  })

  describe('updateSubjectSchema', () => {
    test('should require an id', () => {
      const subject = {
        name: 'Mathématiques',
        abbreviation: 'MATH',
      }
      const result = updateSubjectSchema.safeParse(subject)
      expect(result.success).toBe(false)
    })

    test('should validate with id', () => {
      const subject = {
        id: 1,
        name: 'Mathématiques',
        abbreviation: 'MATH',
      }
      const result = updateSubjectSchema.safeParse(subject)
      expect(result.success).toBe(true)
    })
  })
})

describe('lesson Schemas', () => {
  describe('createLessonSchema', () => {
    test('should validate a valid lesson', () => {
      const validLesson = {
        subjectId: 1,
        title: 'Introduction aux équations',
        description: 'Première leçon sur les équations',
        difficulty: 'easy' as const,
        estimatedDuration: 30,
        isPublished: false,
        displayOrder: 1,
      }
      const result = createLessonSchema.safeParse(validLesson)
      expect(result.success).toBe(true)
    })

    test('should reject invalid difficulty', () => {
      const invalidLesson = {
        subjectId: 1,
        title: 'Introduction',
        difficulty: 'super_hard',
      }
      const result = createLessonSchema.safeParse(invalidLesson)
      expect(result.success).toBe(false)
    })

    test('should require subjectId', () => {
      const invalidLesson = {
        title: 'Introduction',
      }
      const result = createLessonSchema.safeParse(invalidLesson)
      expect(result.success).toBe(false)
    })
  })
})

describe('card Schemas', () => {
  describe('createCardSchema', () => {
    test('should validate a basic card', () => {
      const validCard = {
        lessonId: 1,
        cardType: 'basic' as const,
        frontContent: 'Qu\'est-ce que 2+2?',
        backContent: '4',
        points: 10,
        difficulty: 1,
      }
      const result = createCardSchema.safeParse(validCard)
      expect(result.success).toBe(true)
    })

    test('should validate a multichoice card', () => {
      const validCard = {
        lessonId: 1,
        cardType: 'multichoice' as const,
        frontContent: 'Question',
        backContent: 'Réponse',
        question: 'Quelle est la capitale de la France?',
        options: [
          { id: '1', text: 'Paris', isCorrect: true },
          { id: '2', text: 'Lyon', isCorrect: false },
        ],
        points: 15,
      }
      const result = createCardSchema.safeParse(validCard)
      expect(result.success).toBe(true)
    })

    test('should reject invalid card type', () => {
      const invalidCard = {
        lessonId: 1,
        cardType: 'invalid_type',
        frontContent: 'Question',
        backContent: 'Réponse',
      }
      const result = createCardSchema.safeParse(invalidCard)
      expect(result.success).toBe(false)
    })

    test('should reject difficulty outside range', () => {
      const invalidCard = {
        lessonId: 1,
        cardType: 'basic' as const,
        frontContent: 'Question',
        backContent: 'Réponse',
        difficulty: 10,
      }
      const result = createCardSchema.safeParse(invalidCard)
      expect(result.success).toBe(false)
    })
  })
})

describe('filter Schemas', () => {
  describe('subjectFiltersSchema', () => {
    test('should use default values', () => {
      const result = subjectFiltersSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    test('should accept search parameter', () => {
      const result = subjectFiltersSchema.parse({ search: 'math' })
      expect(result.search).toBe('math')
    })
  })

  describe('lessonFiltersSchema', () => {
    test('should accept all filter parameters', () => {
      const filters = {
        subjectId: 1,
        isPublished: true,
        search: 'équation',
        page: 2,
        limit: 10,
      }
      const result = lessonFiltersSchema.parse(filters)
      expect(result).toStrictEqual(filters)
    })
  })

  describe('cardFiltersSchema', () => {
    test('should accept cardType filter', () => {
      const filters = {
        cardType: 'multichoice' as const,
        lessonId: 1,
      }
      const result = cardFiltersSchema.parse(filters)
      expect(result.cardType).toBe('multichoice')
    })
  })

  describe('userFiltersSchema', () => {
    test('should accept userType filter', () => {
      const filters = {
        userType: 'student' as const,
        gradeId: 5,
        isCompleted: true,
      }
      const result = userFiltersSchema.parse(filters)
      expect(result.userType).toBe('student')
      expect(result.gradeId).toBe(5)
      expect(result.isCompleted).toBe(true)
    })

    test('should use default pagination', () => {
      const result = userFiltersSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })
  })
})
