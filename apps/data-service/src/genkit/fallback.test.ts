import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getSameSubjectDistractors, getSubjectNameFromLesson } from './fallback'

// Mock the database module
vi.mock('@kurama/data-ops/database/setup', () => ({
  getDb: vi.fn(),
}))

describe('fallback', () => {
  const mockDb = {
    query: {
      lessons: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { getDb } = await import('@kurama/data-ops/database/setup')
    // Cast to unknown first to avoid strict type checking on mock
    vi.mocked(getDb).mockReturnValue(mockDb as unknown as ReturnType<typeof getDb>)
  })

  describe('getSameSubjectDistractors', () => {
    test('should return generic fallbacks when lesson not found', async () => {
      mockDb.query.lessons.findFirst.mockResolvedValue(null)

      const result = await getSameSubjectDistractors(999, 'Paris', 3)

      expect(result).toStrictEqual([
        'Aucune de ces réponses',
        'Réponse non disponible',
        'Option alternative',
      ])
    })

    test('should handle database errors gracefully', async () => {
      mockDb.query.lessons.findFirst.mockRejectedValue(new Error('DB Error'))

      const result = await getSameSubjectDistractors(1, 'Paris', 3)

      expect(result).toStrictEqual([
        'Aucune de ces réponses',
        'Réponse non disponible',
        'Option alternative',
      ])
    })

    test('should handle custom count parameter', async () => {
      mockDb.query.lessons.findFirst.mockRejectedValue(new Error('DB Error'))

      const result = await getSameSubjectDistractors(1, 'Paris', 2)

      expect(result).toStrictEqual([
        'Aucune de ces réponses',
        'Réponse non disponible',
      ])
    })
  })

  describe('getSubjectNameFromLesson', () => {
    test('should return "Unknown" for database errors', async () => {
      // Mock the complex query chain to throw an error
      mockDb.select.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const result = await getSubjectNameFromLesson(1)

      expect(result).toBe('Unknown')
    })

    test('should return "Unknown" for lesson not found', async () => {
      // Mock empty result
      const mockQuery = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }

      mockDb.select.mockReturnValue(mockQuery)

      const result = await getSubjectNameFromLesson(999)

      expect(result).toBe('Unknown')
    })
  })
})
