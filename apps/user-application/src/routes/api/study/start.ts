import { getAuth } from '@kurama/data-ops/auth/server'
import { getDb } from '@kurama/data-ops/database/setup'
import { studySessions } from '@kurama/data-ops/drizzle/schema'
import { createFileRoute } from '@tanstack/react-router'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

const startSessionSchema = z.object({
  mode: z.enum(['flashcard', 'quiz', 'test']),
  lessonId: z.number(),
})

export const Route = createFileRoute('/api/study/start')({
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
          const { mode, lessonId } = startSessionSchema.parse(body)

          // Create session
          const db = getDb()
          const [studySession] = await db.insert(studySessions).values({
            userId: session.user.id,
            mode,
            lessonId,
          }).returning()

          return new Response(JSON.stringify(studySession), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        catch (error) {
          console.error('Failed to start session:', error)
          return new Response(JSON.stringify({ error: 'Failed to start session' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
