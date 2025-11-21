import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getLessonsBySubject, submitTestResult } from '../learning'

// Mock dependencies
const mockDb = {
  query: {
    lessons: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    userLessonMastery: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(() => ({ values: vi.fn() })),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
}

vi.mock('@kurama/data-ops/database/setup', () => ({
  getDb: () => mockDb,
}))

vi.mock('@kurama/data-ops/database/drizzle-orm', () => ({
  asc: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  inArray: vi.fn(),
}))

// Mock createServerFn to expose the handler for testing
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const chain = {
      middleware: () => chain,
      inputValidator: () => chain,
      handler: (cb: any) => cb,
    }
    return chain
  },
}))

vi.mock('@/core/middleware/auth', () => ({
  protectedFunctionMiddleware: {},
}))

describe('learning functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLessonsBySubject', () => {
    test('should return lessons with correct lock status', async () => {
      const mockLessons = [
        { id: 1, title: 'Lesson 1', displayOrder: 1, subjectId: 1 },
        { id: 2, title: 'Lesson 2', displayOrder: 2, subjectId: 1 },
        { id: 3, title: 'Lesson 3', displayOrder: 3, subjectId: 1 },
      ]

      const mockMastery = [
        { lessonId: 1, successfulTestCount: 2, lastTestScore: 90 }, // Mastered
        { lessonId: 2, successfulTestCount: 1, lastTestScore: 85 }, // In progress
      ]

      mockDb.query.lessons.findMany.mockResolvedValue(mockLessons)
      mockDb.query.userLessonMastery.findMany.mockResolvedValue(mockMastery)

      // getLessonsBySubject is mocked to return the handler directly
      const handler = getLessonsBySubject as any
      const result = await handler({
        data: 1,
        context: { userId: 'user1' },
      })

      expect(result).toHaveLength(3)

      // Lesson 1: Always unlocked (first)
      expect(result[0].id).toBe(1)
      expect(result[0].isLocked).toBe(false)
      expect(result[0].isCompleted).toBe(true)

      // Lesson 2: Unlocked because Lesson 1 is mastered
      expect(result[1].id).toBe(2)
      expect(result[1].isLocked).toBe(false)
      expect(result[1].isCompleted).toBe(false)
      expect(result[1].masteryCount).toBe(1)

      // Lesson 3: Locked because Lesson 2 is not mastered (count < 2)
      expect(result[2].id).toBe(3)
      expect(result[2].isLocked).toBe(true)
    })
  })

  describe('submitTestResult', () => {
    test('should record passing test and update mastery', async () => {
      const mockLesson = { id: 1, subjectId: 1, displayOrder: 1 }
      const mockNextLesson = { id: 2, subjectId: 1, displayOrder: 2, title: 'Next Lesson' }

      mockDb.query.userLessonMastery.findFirst.mockResolvedValue({
        successfulTestCount: 1,
        isUnlocked: false,
      })

      mockDb.query.lessons.findFirst
        .mockResolvedValueOnce(mockLesson) // Current lesson
        .mockResolvedValueOnce(mockNextLesson) // Next lesson

      const handler = submitTestResult as any
      const result = await handler({
        data: { lessonId: 1, correctCount: 8, totalCount: 10 }, // 80%
        context: { userId: 'user1' },
      })

      expect(result.percentage).toBe(80)
      expect(result.isPassing).toBe(true)
      expect(result.masteryCount).toBe(2)
      expect(result.isCompleted).toBe(true)
      expect(result.nextLessonUnlocked).toBe(true)
      expect(result.nextLessonTitle).toBe('Next Lesson')

      // Verify DB update
      expect(mockDb.update).toHaveBeenCalled()
    })

    test('should not increment mastery count for failing score', async () => {
      mockDb.query.userLessonMastery.findFirst.mockResolvedValue({
        successfulTestCount: 1,
        isUnlocked: false,
      })

      const handler = submitTestResult as any
      const result = await handler({
        data: { lessonId: 1, correctCount: 7, totalCount: 10 }, // 70%
        context: { userId: 'user1' },
      })

      expect(result.percentage).toBe(70)
      expect(result.isPassing).toBe(false)
      expect(result.masteryCount).toBe(1)
      expect(result.isCompleted).toBe(false)

      // Verify DB update (still updates last score but not count)
      expect(mockDb.update).toHaveBeenCalled()
    })
  })
})
