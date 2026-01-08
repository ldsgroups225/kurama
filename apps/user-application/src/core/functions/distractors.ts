import process from 'node:process'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

// Input schema matching backend API
const GenerateDistractorsInputSchema = z.object({
  question: z.string().min(1),
  correctAnswer: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.number().int().min(0).max(2).default(1),
  cardType: z.string().default('basic'),
  lessonId: z.number().int().positive(),
  userId: z.string().min(1),
})

// Response schema from backend
const GenerateDistractorsResponseSchema = z.object({
  distractors: z.array(z.string()),
  cached: z.boolean(),
  fallback: z.boolean(),
  subject: z.string(),
})

export type GenerateDistractorsInput = z.infer<typeof GenerateDistractorsInputSchema>
export type GenerateDistractorsResponse = z.infer<typeof GenerateDistractorsResponseSchema>

/**
 * Generate distractors for a quiz question using AI or fallback
 */
export const generateDistractors = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: Omit<GenerateDistractorsInput, 'userId'>) => {
    return GenerateDistractorsInputSchema.omit({ userId: true }).parse(data)
  })
  .handler(async ({ data, context }): Promise<GenerateDistractorsResponse> => {
    const userId = context.userId

    // Get backend URL from environment
    const backendUrl = process.env.VITE_BACKEND_URL || 'https://back-kurama.yeko.workers.dev'

    try {
      const response = await fetch(`${backendUrl}/api/distractors/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return GenerateDistractorsResponseSchema.parse(result)
    }
    catch (error) {
      console.error('Error calling distractor API:', error)

      // Fallback to generic distractors if API fails
      return {
        distractors: ['Option A', 'Option B', 'Option C'],
        cached: false,
        fallback: true,
        subject: data.subject,
      }
    }
  })

/**
 * Generate enhanced test questions with AI-powered distractors
 */
export const generateEnhancedTestQuestions = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: {
    cards: Array<{
      id: number
      frontContent: string
      backContent: string
      cardType: string
      difficulty: number
      lessonId: number
      subjectName: string
      subjectId: number
    }>
  }) => data)
  .handler(async ({ data }) => {
    const { cards } = data

    const enhancedQuestions = []

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index]!
      const questionType: 'multiple-choice' | 'true-false' = index % 2 === 0 ? 'multiple-choice' : 'true-false'

      if (questionType === 'multiple-choice') {
        try {
          // Call AI distractor generation
          const distractorResult = await generateDistractors({
            data: {
              question: card.frontContent,
              correctAnswer: card.backContent,
              subject: card.subjectName,
              difficulty: card.difficulty,
              cardType: card.cardType,
              lessonId: card.lessonId,
            },
          })

          const options = [
            { id: 'correct', text: card.backContent, isCorrect: true },
            ...distractorResult.distractors.map((text, i) => ({
              id: `distractor-${i}`,
              text,
              isCorrect: false,
            })),
          ]

          // Shuffle options deterministically
          const shuffledOptions = options.sort((a, b) => {
            const hashA = (a.id.charCodeAt(0) * 31 + index) % 1000
            const hashB = (b.id.charCodeAt(0) * 31 + index) % 1000
            return hashA - hashB
          })

          enhancedQuestions.push({
            ...card,
            questionType: 'multiple-choice' as const,
            question: card.frontContent,
            options: shuffledOptions,
            aiGenerated: !distractorResult.fallback,
            cached: distractorResult.cached,
          })
        }
        catch (error) {
          console.error('Failed to generate AI distractors for card', card.id, error)

          // Fallback to same-subject distractors
          const otherCards = cards.filter((_, i) =>
            i !== index
            && cards[i]!.subjectId === card.subjectId
            && cards[i]!.backContent !== card.backContent,
          )

          const wrongAnswers = otherCards
            .slice(0, 3)
            .map(c => c.backContent)

          // Pad if needed
          while (wrongAnswers.length < 3) {
            wrongAnswers.push(`Option ${wrongAnswers.length + 1}`)
          }

          const options = [
            { id: 'correct', text: card.backContent, isCorrect: true },
            ...wrongAnswers.map((text, i) => ({
              id: `fallback-${i}`,
              text,
              isCorrect: false,
            })),
          ].sort((a, b) => {
            const hashA = (a.id.charCodeAt(0) * 31 + index) % 1000
            const hashB = (b.id.charCodeAt(0) * 31 + index) % 1000
            return hashA - hashB
          })

          enhancedQuestions.push({
            ...card,
            questionType: 'multiple-choice' as const,
            question: card.frontContent,
            options,
            aiGenerated: false,
            cached: false,
          })
        }
      }
      else {
        // True/False questions remain the same
        const isTrue = index % 3 !== 0
        const statement = isTrue
          ? `${card.frontContent} : ${card.backContent}`
          : `${card.frontContent} : Réponse incorrecte`

        enhancedQuestions.push({
          ...card,
          questionType: 'true-false' as const,
          frontContent: statement,
          correctAnswer: isTrue ? 'true' : 'false',
          aiGenerated: false,
          cached: false,
        })
      }
    }

    return enhancedQuestions
  })
