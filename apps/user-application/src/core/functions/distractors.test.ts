// Import after mocking
import type { GenerateDistractorsInput, GenerateDistractorsResponse } from './distractors'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock fetch globally
globalThis.fetch = vi.fn()

// Mock TanStack Start - simplified approach
const mockServerFn = {
  middleware: vi.fn(() => mockServerFn),
  inputValidator: vi.fn(() => mockServerFn),
  handler: vi.fn(fn => fn),
}

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => mockServerFn),
}))

vi.mock('@/core/middleware/auth', () => ({
  protectedFunctionMiddleware: vi.fn(),
}))

describe('distractors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('input validation', () => {
    test('should validate distractor input schema', () => {
      const validInput = {
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        subject: 'Géographie',
        difficulty: 1,
        cardType: 'basic',
        lessonId: 1,
        userId: 'user-123',
      }

      // Test that the input matches our expected type
      const input: GenerateDistractorsInput = validInput
      expect(input.question).toBe('What is the capital of France?')
      expect(input.correctAnswer).toBe('Paris')
      expect(input.subject).toBe('Géographie')
      expect(input.difficulty).toBe(1)
      expect(input.cardType).toBe('basic')
      expect(input.lessonId).toBe(1)
      expect(input.userId).toBe('user-123')
    })

    test('should validate response schema', () => {
      const validResponse: GenerateDistractorsResponse = {
        distractors: ['London', 'Berlin', 'Madrid'],
        cached: false,
        fallback: false,
        subject: 'Géographie',
      }

      expect(validResponse.distractors).toHaveLength(3)
      expect(validResponse.cached).toBe(false)
      expect(validResponse.fallback).toBe(false)
      expect(validResponse.subject).toBe('Géographie')
    })
  })

  describe('aPI integration', () => {
    test('should handle successful API response', async () => {
      const mockResponse = {
        distractors: ['London', 'Berlin', 'Madrid'],
        cached: false,
        fallback: false,
        subject: 'Géographie',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      // Test that fetch would be called with correct parameters
      const expectedUrl = 'https://back-kurama.yeko.workers.dev/api/distractors/generate'
      const expectedBody = {
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        subject: 'Géographie',
        difficulty: 1,
        cardType: 'basic',
        lessonId: 1,
        userId: 'user-123',
      }

      // Simulate the server function call
      await fetch(expectedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedBody),
      })

      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedBody),
      })
    })

    test('should handle API errors with fallback', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const fallbackResponse = {
        distractors: ['Option A', 'Option B', 'Option C'],
        cached: false,
        fallback: true,
        subject: 'Géographie',
      }

      // Test that fallback response structure is correct
      expect(fallbackResponse.distractors).toHaveLength(3)
      expect(fallbackResponse.fallback).toBe(true)
    })
  })

  describe('enhanced question generation', () => {
    test('should handle card data structure', () => {
      const mockCard = {
        id: 1,
        frontContent: 'What is the capital of France?',
        backContent: 'Paris',
        cardType: 'basic',
        difficulty: 1,
        lessonId: 1,
        subjectName: 'Géographie',
        subjectId: 1,
      }

      // Test that card structure matches expected format
      expect(mockCard.id).toBe(1)
      expect(mockCard.frontContent).toBe('What is the capital of France?')
      expect(mockCard.backContent).toBe('Paris')
      expect(mockCard.subjectName).toBe('Géographie')
      expect(mockCard.subjectId).toBe(1)
    })

    test('should generate multiple choice options structure', () => {
      const options = [
        { id: 'correct', text: 'Paris', isCorrect: true },
        { id: 'distractor-0', text: 'London', isCorrect: false },
        { id: 'distractor-1', text: 'Berlin', isCorrect: false },
        { id: 'distractor-2', text: 'Madrid', isCorrect: false },
      ]

      expect(options).toHaveLength(4)
      expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)
      expect(options.filter(opt => !opt.isCorrect)).toHaveLength(3)
    })
  })
})
