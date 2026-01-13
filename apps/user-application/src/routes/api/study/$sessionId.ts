import { eq, inArray } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, studySessions } from '@kurama/data-ops/drizzle/schema'
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
          let sessionCards: typeof cards.$inferSelect[] = []

          if (session.lessonId) {
            sessionCards = await db.query.cards.findMany({
              where: eq(cards.lessonId, session.lessonId),
              orderBy: (cards, { asc }) => [asc(cards.displayOrder)],
            })
          }
          else if (session.subjectId) {
            // TRANSVERSAL REVIEW: Get cards from all lessons in this subject
            // Note: In a real app, we'd filter by user's grade/series here too
            // But since studySessions are created for a specific user,
            // the subjectId should already imply their curriculum.

            const subjectLessons = await db.query.lessons.findMany({
              where: eq(lessons.subjectId, session.subjectId),
              columns: { id: true },
            })

            const lessonIds = subjectLessons.map(l => l.id)

            if (lessonIds.length > 0) {
              sessionCards = await db.query.cards.findMany({
                where: inArray(cards.lessonId, lessonIds),
                orderBy: (cards, { asc }) => [asc(cards.lessonId), asc(cards.displayOrder)],
                limit: 50, // Limit for broad subject sessions to avoid overload
              })
            }
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
