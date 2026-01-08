import { and, eq, ne, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, subjects } from '@kurama/data-ops/drizzle/schema'

/**
 * Fallback: Get distractors from same subject when Gemini fails
 */
export async function getSameSubjectDistractors(
  lessonId: number,
  correctAnswer: string,
  count: number = 3,
): Promise<string[]> {
  try {
    const db = getDb()

    // Get the subject ID for this lesson
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { subjectId: true },
    })

    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`)
    }

    // Get other cards from the same subject
    const otherCards = await db
      .select({
        backContent: cards.backContent,
      })
      .from(cards)
      .innerJoin(lessons, eq(cards.lessonId, lessons.id))
      .where(
        and(
          eq(lessons.subjectId, lesson.subjectId),
          ne(cards.backContent, correctAnswer),
          ne(cards.lessonId, lessonId), // Avoid cards from same lesson
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(count * 2) // Get extra in case of duplicates

    // Filter out duplicates and similar answers
    const uniqueAnswers = Array.from(new Set(
      otherCards
        .map(card => card.backContent)
        .filter(answer =>
          answer.toLowerCase() !== correctAnswer.toLowerCase()
          && answer.length > 0,
        ),
    ))

    // Return the requested count, or pad with generic distractors if needed
    const result = uniqueAnswers.slice(0, count)

    // If we don't have enough, add generic distractors
    while (result.length < count) {
      result.push(`Option ${result.length + 1}`)
    }

    return result
  }
  catch (error) {
    console.error('Error getting same-subject distractors:', error)

    // Ultimate fallback: generic distractors
    return Array.from({ length: count }, (_, i) => `Option ${i + 1}`)
  }
}

/**
 * Get subject name from lesson ID (for logging/debugging)
 */
export async function getSubjectNameFromLesson(lessonId: number): Promise<string> {
  try {
    const db = getDb()

    const result = await db
      .select({
        subjectName: subjects.name,
      })
      .from(lessons)
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(lessons.id, lessonId))
      .limit(1)

    return result[0]?.subjectName || 'Unknown'
  }
  catch (error) {
    console.error('Error getting subject name:', error)
    return 'Unknown'
  }
}
