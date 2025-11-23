import { getAuth } from '@kurama/data-ops/auth/server'
import { and, eq } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { userProgress } from '@kurama/data-ops/drizzle/schema'
import { createFileRoute } from '@tanstack/react-router'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { calculateNextReview, responseToQuality } from '@/lib/spaced-repetition'

const progressSchema = z.object({
  sessionId: z.number(),
  lessonId: z.number(),
  cardId: z.number(),
  isCorrect: z.boolean(),
  timeSpent: z.number(),
  confidence: z.enum(['easy', 'medium', 'hard']).optional(),
})

export const Route = createFileRoute('/api/study/progress')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get authenticated user
          const auth = getAuth()
          const req = getRequest()
          const session = await auth.api.getSession(req)

          if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const body = await request.json()
          const { lessonId, cardId, isCorrect, confidence } = progressSchema.parse(body)

          const db = getDb()

          // Get existing progress for this card
          const [existingProgress] = await db
            .select()
            .from(userProgress)
            .where(
              and(
                eq(userProgress.userId, session.user.id),
                eq(userProgress.cardId, cardId),
              ),
            )
            .limit(1)

          // Convert response to SM-2 quality score
          const quality = responseToQuality(
            isCorrect ? 'correct' : 'incorrect',
            confidence,
          )

          // Calculate next review using SM-2 algorithm
          const currentProgress = existingProgress
            ? {
                easinessFactor: existingProgress.easeFactor / 1000, // Convert from integer (2500 -> 2.5)
                interval: existingProgress.interval,
                repetitions: existingProgress.repetitions,
                lastReview: new Date(existingProgress.lastReviewedAt || Date.now()).getTime(),
              }
            : undefined

          const sm2Result = calculateNextReview(quality, currentProgress)

          // Prepare progress data
          const progressData = {
            userId: session.user.id,
            cardId,
            lessonId,
            easeFactor: Math.round(sm2Result.easinessFactor * 1000), // Convert to integer (2.5 -> 2500)
            interval: sm2Result.interval,
            repetitions: sm2Result.repetitions,
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: new Date(sm2Result.nextReviewDate).toISOString(),
            totalReviews: (existingProgress?.totalReviews || 0) + 1,
            correctReviews: (existingProgress?.correctReviews || 0) + (isCorrect ? 1 : 0),
            updatedAt: new Date().toISOString(),
          }

          if (existingProgress) {
            // Update existing progress
            await db
              .update(userProgress)
              .set(progressData)
              .where(eq(userProgress.id, existingProgress.id))
          }
          else {
            // Insert new progress
            await db.insert(userProgress).values(progressData)
          }

          return new Response(JSON.stringify({
            success: true,
            nextReview: new Date(sm2Result.nextReviewDate).toISOString(),
            interval: sm2Result.interval,
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        catch (error) {
          console.error('Failed to record progress:', error)
          return new Response(JSON.stringify({ error: 'Failed to record progress' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
