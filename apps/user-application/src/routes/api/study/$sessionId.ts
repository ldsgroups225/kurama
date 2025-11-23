import { eq } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, studySessions } from '@kurama/data-ops/drizzle/schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/study/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const sessionId = Number.parseInt(params.sessionId)
          if (Number.isNaN(sessionId)) {
            return new Response(JSON.stringify({ error: 'Invalid session ID' }), { status: 400 })
          }

          // Get Session
          const db = getDb()
          const session = await db.query.studySessions.findFirst({
            where: eq(studySessions.id, sessionId),
          })

          if (!session) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
          }

          // Get Cards
          // Logic depends on session mode and lessonId
          let sessionCards: typeof cards.$inferSelect[] = []

          if (session.lessonId) {
            sessionCards = await db.query.cards.findMany({
              where: eq(cards.lessonId, session.lessonId),
              orderBy: (cards, { asc }) => [asc(cards.displayOrder)],
            })
          }
          else {
            // TODO: Handle subject-level or deck-level sessions
            // For now return empty or mock
          }

          // Filter cards based on mode if needed (e.g. only multichoice for Quiz mode)
          // This logic can be refined based on learning_mode_configs

          return new Response(JSON.stringify({ session, cards: sessionCards }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        catch (error) {
          console.error('Failed to fetch session:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch session' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
