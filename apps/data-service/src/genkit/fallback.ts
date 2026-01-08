import { and, eq, ne, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, subjects } from '@kurama/data-ops/drizzle/schema'

/**
 * Fallback: Get distractors from same subject when Gemini fails
 * Ensures minimum count is always returned with generic fallbacks if needed
 */
export async function getSameSubjectDistractors(
  lessonId: number,
  correctAnswer: string,
  count: number = 3,
): Promise<string[]> {
  const genericFallbacks = [
    'Aucune de ces réponses',
    'Réponse non disponible',
    'Option alternative',
    'Autre possibilité',
  ]

  try {
    const db = getDb()

    // Get the subject ID for this lesson
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { subjectId: true },
    })

    if (!lesson) {
      console.warn(`Lesson ${lessonId} not found, using generic fallbacks`)
      return genericFallbacks.slice(0, count)
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
      .limit(count * 3) // Get extra buffer for filtering

    // Filter out duplicates and similar answers
    const uniqueAnswers = Array.from(new Set(
      otherCards
        .map(card => card.backContent)
        .filter(answer =>
          answer.toLowerCase() !== correctAnswer.toLowerCase()
          && answer.length > 0
          && answer.length < 500, // Reasonable length
        ),
    ))

    // Start with unique answers from database
    const result = uniqueAnswers.slice(0, count)

    // Pad with generic fallbacks if needed
    let fallbackIndex = 0
    while (result.length < count && fallbackIndex < genericFallbacks.length) {
      const fallback = genericFallbacks[fallbackIndex]
      if (fallback && !result.includes(fallback)) {
        result.push(fallback)
      }
      fallbackIndex++
    }

    // Ultimate fallback: numbered options
    while (result.length < count) {
      result.push(`Option ${result.length + 1}`)
    }

    return result.slice(0, count)
  }
  catch (error) {
    console.error('Error getting same-subject distractors:', error)

    // Ultimate fallback: generic distractors
    return genericFallbacks.slice(0, count)
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
