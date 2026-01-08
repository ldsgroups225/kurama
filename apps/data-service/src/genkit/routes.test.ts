import { beforeEach, describe, expect, test, vi } from 'vitest'
import { genkitRoutes } from './routes'

// Mock dependencies
vi.mock('./flows/generate-distractors', () => ({
  generateDistractors: vi.fn(),
  createCacheKey: vi.fn(() => 'test-cache-key'),
  DistractorInputSchema: {
    extend: vi.fn(() => ({
      parse: vi.fn(data => data),
    })),
  },
}))

vi.mock('./fallback', () => ({
  getSameSubjectDistractors: vi.fn(() => Promise.resolve(['Fallback1', 'Fallback2', 'Fallback3'])),
  getSubjectNameFromLesson: vi.fn(() => Promise.resolve('Géographie')),
}))

describe('genkit routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('gET /api/distractors/health', () => {
    test('should return health status with Gemini configured', async () => {
      const mockEnv = {
        GEMINI_API_KEY: 'test-key',
      }

      const res = await genkitRoutes.request('/api/distractors/health', {
        method: 'GET',
      }, mockEnv)

      expect(res.status).toBe(200)

      const data = await res.json() as Record<string, unknown>
      expect(data).toMatchObject({
        status: 'ok',
        geminiConfigured: true,
        cacheAvailable: false,
      })
      expect(data.timestamp).toBeDefined()
    })

    test('should return health status without Gemini configured', async () => {
      const res = await genkitRoutes.request('/api/distractors/health', {
        method: 'GET',
      }, {})

      expect(res.status).toBe(200)

      const data = await res.json() as Record<string, unknown>
      expect(data).toMatchObject({
        status: 'ok',
        geminiConfigured: false,
        cacheAvailable: false,
      })
    })

    test('should detect cache availability', async () => {
      const mockKV = { get: vi.fn(), put: vi.fn() }
      const mockEnv = {
        GEMINI_API_KEY: 'test-key',
        DISTRACTORS_CACHE: mockKV,
      }

      const res = await genkitRoutes.request('/api/distractors/health', {
        method: 'GET',
      }, mockEnv)

      expect(res.status).toBe(200)

      const data = await res.json() as Record<string, unknown>
      expect(data.cacheAvailable).toBe(true)
    })
  })

  // Note: POST /api/distractors/generate tests would require more complex mocking
  // of the validation middleware and rate limiting. These are better tested as integration tests.
})
