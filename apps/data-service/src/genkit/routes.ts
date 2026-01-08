import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { getSameSubjectDistractors, getSubjectNameFromLesson } from './fallback'
import {
  createCacheKey,
  DistractorInputSchema,
  generateDistractors,
} from './flows/generate-distractors'

// Extended Env type for Genkit routes
interface GenkitEnv {
  GEMINI_API_KEY: string
  DISTRACTORS_CACHE?: KVNamespace // Optional KV binding for caching
}

export const genkitRoutes = new Hono<{ Bindings: GenkitEnv }>()

// Rate limiting (simple in-memory for now)
const rateLimits = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_PER_MINUTE = 10
const RATE_LIMIT_PER_DAY = 100

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const minuteKey = `${userId}:${Math.floor(now / 60000)}`
  const dayKey = `${userId}:${Math.floor(now / 86400000)}`

  // Check minute limit
  const minuteLimit = rateLimits.get(minuteKey) || { count: 0, resetTime: now + 60000 }
  if (minuteLimit.count >= RATE_LIMIT_PER_MINUTE) {
    return false
  }

  // Check day limit
  const dayLimit = rateLimits.get(dayKey) || { count: 0, resetTime: now + 86400000 }
  if (dayLimit.count >= RATE_LIMIT_PER_DAY) {
    return false
  }

  // Update counters
  rateLimits.set(minuteKey, { ...minuteLimit, count: minuteLimit.count + 1 })
  rateLimits.set(dayKey, { ...dayLimit, count: dayLimit.count + 1 })

  // Clean up old entries
  if (rateLimits.size > 1000) {
    for (const [key, limit] of rateLimits.entries()) {
      if (limit.resetTime < now) {
        rateLimits.delete(key)
      }
    }
  }

  return true
}

// Request schema with additional metadata
const GenerateDistractorsRequestSchema = DistractorInputSchema.extend({
  lessonId: z.number().int().positive(),
  userId: z.string().min(1), // For rate limiting
})

/**
 * POST /api/distractors/generate
 * Generate distractors for a quiz question
 */
genkitRoutes.post(
  '/api/distractors/generate',
  zValidator('json', GenerateDistractorsRequestSchema),
  async (c) => {
    const input = c.req.valid('json')
    const { lessonId, userId, ...distractorInput } = input

    try {
      // Rate limiting
      if (!checkRateLimit(userId)) {
        return c.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          429,
        )
      }

      // Create cache key
      const cacheKey = createCacheKey(distractorInput)
      const cached = false
      let fallback = false

      // Try cache first (if KV is available)
      if (c.env.DISTRACTORS_CACHE) {
        try {
          const cachedResult = await c.env.DISTRACTORS_CACHE.get(cacheKey, 'json') as { distractors: string[] } | null
          if (cachedResult) {
            return c.json({
              distractors: cachedResult.distractors,
              cached: true,
              fallback: false,
              subject: distractorInput.subject,
            })
          }
        }
        catch (error) {
          console.warn('Cache read error:', error)
        }
      }

      let distractors: string[]

      try {
        // Try Gemini generation
        const result = await generateDistractors(distractorInput)
        distractors = result.distractors

        // Cache the result (if KV is available)
        if (c.env.DISTRACTORS_CACHE) {
          try {
            await c.env.DISTRACTORS_CACHE.put(
              cacheKey,
              JSON.stringify({ distractors }),
              { expirationTtl: 30 * 24 * 60 * 60 }, // 30 days
            )
          }
          catch (error) {
            console.warn('Cache write error:', error)
          }
        }
      }
      catch (error) {
        console.warn('Gemini generation failed, using fallback:', error)

        // Fallback to same-subject distractors
        distractors = await getSameSubjectDistractors(
          lessonId,
          distractorInput.correctAnswer,
          3,
        )
        fallback = true
      }

      // Get subject name for response
      const subjectName = await getSubjectNameFromLesson(lessonId)

      return c.json({
        distractors,
        cached,
        fallback,
        subject: subjectName,
      })
    }
    catch (error) {
      console.error('Error in distractor generation:', error)
      return c.json(
        { error: 'Failed to generate distractors' },
        500,
      )
    }
  },
)

/**
 * GET /api/distractors/health
 * Health check for Genkit integration
 */
genkitRoutes.get('/api/distractors/health', async (c) => {
  const hasGeminiKey = !!c.env.GEMINI_API_KEY
  const hasCache = !!c.env.DISTRACTORS_CACHE

  return c.json({
    status: 'ok',
    geminiConfigured: hasGeminiKey,
    cacheAvailable: hasCache,
    timestamp: new Date().toISOString(),
  })
})
