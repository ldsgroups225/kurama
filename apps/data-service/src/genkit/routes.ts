import { GoogleGenAI } from '@google/genai'
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
  DISTRACTORS_CACHE?: KVNamespace // KV binding for caching and rate limiting
}

// Standardized API error response
interface ApiErrorResponse {
  error: string
  code: string
  details?: unknown
  timestamp: string
}

function errorResponse(
  c: { json: <T>(data: T, status: number) => Response },
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return c.json<ApiErrorResponse>({
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  }, status)
}

export const genkitRoutes = new Hono<{ Bindings: GenkitEnv }>()

// Rate limiting constants
const RATE_LIMIT_PER_MINUTE = 10
const RATE_LIMIT_PER_DAY = 100

/**
 * Check rate limit using KV storage (works across Workers isolates)
 * Falls back to allowing requests if KV is unavailable
 */
async function checkRateLimit(
  kv: KVNamespace | undefined,
  userId: string,
): Promise<{ allowed: boolean, remaining: { minute: number, day: number } }> {
  // If no KV, allow but log warning
  if (!kv) {
    console.warn('Rate limiting KV not configured - allowing request')
    return { allowed: true, remaining: { minute: RATE_LIMIT_PER_MINUTE, day: RATE_LIMIT_PER_DAY } }
  }

  const now = Date.now()
  const minuteBucket = Math.floor(now / 60000)
  const dayBucket = Math.floor(now / 86400000)

  const minuteKey = `ratelimit:minute:${userId}:${minuteBucket}`
  const dayKey = `ratelimit:day:${userId}:${dayBucket}`

  try {
    // Get current counts
    const [minuteCount, dayCount] = await Promise.all([
      kv.get(minuteKey).then(v => v ? Number.parseInt(v, 10) : 0),
      kv.get(dayKey).then(v => v ? Number.parseInt(v, 10) : 0),
    ])

    // Check limits
    if (minuteCount >= RATE_LIMIT_PER_MINUTE) {
      return {
        allowed: false,
        remaining: { minute: 0, day: Math.max(0, RATE_LIMIT_PER_DAY - dayCount) },
      }
    }

    if (dayCount >= RATE_LIMIT_PER_DAY) {
      return {
        allowed: false,
        remaining: { minute: Math.max(0, RATE_LIMIT_PER_MINUTE - minuteCount), day: 0 },
      }
    }

    // Increment counters (fire and forget for performance)
    await Promise.all([
      kv.put(minuteKey, String(minuteCount + 1), { expirationTtl: 120 }), // 2 min TTL
      kv.put(dayKey, String(dayCount + 1), { expirationTtl: 90000 }), // 25 hour TTL
    ])

    return {
      allowed: true,
      remaining: {
        minute: RATE_LIMIT_PER_MINUTE - minuteCount - 1,
        day: RATE_LIMIT_PER_DAY - dayCount - 1,
      },
    }
  }
  catch (error) {
    console.error('Rate limit check failed:', error)
    // Allow on error to avoid blocking legitimate requests
    return { allowed: true, remaining: { minute: RATE_LIMIT_PER_MINUTE, day: RATE_LIMIT_PER_DAY } }
  }
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
      // Check for API key
      if (!c.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not configured, using fallback')
        const distractors = await getSameSubjectDistractors(
          lessonId,
          distractorInput.correctAnswer,
          3,
        )
        const subjectName = await getSubjectNameFromLesson(lessonId)
        return c.json({
          distractors,
          cached: false,
          fallback: true,
          subject: subjectName,
        })
      }

      // Rate limiting with KV storage
      const rateLimit = await checkRateLimit(c.env.DISTRACTORS_CACHE, userId)
      if (!rateLimit.allowed) {
        return errorResponse(c, 429, 'RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please try again later.', {
          remaining: rateLimit.remaining,
          retryAfter: rateLimit.remaining.minute === 0 ? 60 : 86400,
        })
      }

      // Create cache key
      const cacheKey = createCacheKey(distractorInput)
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
        // Initialize Google GenAI client
        const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY })

        // Try Gemini generation
        const result = await generateDistractors(ai, distractorInput)
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
        cached: false,
        fallback,
        subject: subjectName,
      })
    }
    catch (error) {
      console.error('Error in distractor generation:', error)
      return errorResponse(c, 500, 'INTERNAL_ERROR', 'Failed to generate distractors', {
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
)

/**
 * GET /api/distractors/health
 * Health check for GenAI integration
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
