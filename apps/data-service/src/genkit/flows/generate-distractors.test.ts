import type { DistractorInput } from './generate-distractors'
import { describe, expect, test } from 'vitest'
import { createCacheKey } from './generate-distractors'

describe('generate-distractors', () => {
  const mockInput: DistractorInput = {
    question: 'What is the capital of France?',
    correctAnswer: 'Paris',
    subject: 'Géographie',
    difficulty: 1,
    cardType: 'basic',
  }

  describe('createCacheKey', () => {
    test('should generate consistent cache keys for same input', () => {
      const key1 = createCacheKey(mockInput)
      const key2 = createCacheKey(mockInput)

      expect(key1).toBe(key2)
      expect(key1).toMatch(/^distractors:[a-z0-9]+$/)
    })

    test('should generate different cache keys for different inputs', () => {
      const input2 = { ...mockInput, question: 'Different question?' }

      const key1 = createCacheKey(mockInput)
      const key2 = createCacheKey(input2)

      expect(key1).not.toBe(key2)
    })

    test('should include all input fields in cache key', () => {
      const baseKey = createCacheKey(mockInput)

      // Change each field and verify key changes
      const fields: (keyof DistractorInput)[] = ['question', 'correctAnswer', 'subject', 'difficulty', 'cardType']

      fields.forEach((field) => {
        const modifiedInput = { ...mockInput }
        if (field === 'difficulty') {
          modifiedInput[field] = 2
        }
        else {
          modifiedInput[field] = `modified-${field}`
        }

        const modifiedKey = createCacheKey(modifiedInput)
        expect(modifiedKey).not.toBe(baseKey)
      })
    })
  })

  // Note: generateDistractors function tests would require mocking Genkit
  // which is complex in the current setup. These would be better as integration tests.
})
