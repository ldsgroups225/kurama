import { createServerFn } from '@tanstack/react-start'
import { eq, like, sql, asc, and } from '@kurama/data-ops/database/drizzle-orm'
import { cards, lessons } from '@kurama/data-ops/drizzle/schema'
import { adminMiddleware } from '../middleware/admin-auth'
import { initAdminDb, getDb } from '@/lib/db'
import {
  createCardSchema,
  updateCardSchema,
  cardFiltersSchema,
  type CreateCardInput,
  type UpdateCardInput,
  type CardFilters,
} from '@/lib/schemas'

// Get cards with filters
export const getCards = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: CardFilters) => cardFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()
    const { lessonId, cardType, search, page, limit } = data

    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = []
    if (lessonId) conditions.push(eq(cards.lessonId, lessonId))
    if (cardType) conditions.push(eq(cards.cardType, cardType))
    if (search) conditions.push(like(cards.frontContent, `%${search}%`))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get cards with lesson info
    const cardList = await db
      .select({
        id: cards.id,
        lessonId: cards.lessonId,
        lessonTitle: lessons.title,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
        displayOrder: cards.displayOrder,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      })
      .from(cards)
      .leftJoin(lessons, eq(cards.lessonId, lessons.id))
      .where(whereClause)
      .orderBy(asc(cards.displayOrder))
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(cards)
      .where(whereClause)

    const count = countResult[0]?.count ?? 0

    return {
      cards: cardList,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    }
  })

// Get single card
export const getCard = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .select({
        id: cards.id,
        lessonId: cards.lessonId,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
        displayOrder: cards.displayOrder,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      })
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1)

    const card = result[0]
    if (!card) {
      throw new Error('Carte non trouvée')
    }

    return card
  })

// Create card
export const createCard = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: CreateCardInput) => createCardSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    // Get max display order for this lesson
    const maxOrderResult = await db
      .select({ max: sql<number>`COALESCE(MAX(${cards.displayOrder}), 0)` })
      .from(cards)
      .where(eq(cards.lessonId, data.lessonId))

    const maxOrder = maxOrderResult[0]?.max ?? 0

    const result = await db
      .insert(cards)
      .values({
        ...data,
        displayOrder: data.displayOrder || (Number(maxOrder) + 1),
      })
      .returning({
        id: cards.id,
        lessonId: cards.lessonId,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
        displayOrder: cards.displayOrder,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      })

    const card = result[0]
    if (!card) {
      throw new Error('Erreur lors de la création')
    }

    console.log(`[AUDIT] Card created by ${context.email}:`, card.id)

    return card
  })

// Update card
export const updateCard = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: UpdateCardInput) => updateCardSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { id, ...updateData } = data

    const result = await db
      .update(cards)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(cards.id, id))
      .returning({
        id: cards.id,
        lessonId: cards.lessonId,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
        displayOrder: cards.displayOrder,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      })

    const card = result[0]
    if (!card) {
      throw new Error('Carte non trouvée')
    }

    console.log(`[AUDIT] Card updated by ${context.email}:`, id)

    return card
  })

// Delete card
export const deleteCard = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .delete(cards)
      .where(eq(cards.id, id))
      .returning()

    const deleted = result[0]
    if (!deleted) {
      throw new Error('Carte non trouvée')
    }

    console.log(`[AUDIT] Card deleted by ${context.email}:`, id)

    return { success: true }
  })

// Duplicate card
export const duplicateCard = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    // Get original card
    const originalResult = await db
      .select({
        lessonId: cards.lessonId,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
      })
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1)

    const original = originalResult[0]
    if (!original) {
      throw new Error('Carte non trouvée')
    }

    // Get max display order
    const maxOrderResult = await db
      .select({ max: sql<number>`COALESCE(MAX(${cards.displayOrder}), 0)` })
      .from(cards)
      .where(eq(cards.lessonId, original.lessonId))

    const maxOrder = maxOrderResult[0]?.max ?? 0

    // Create duplicate
    const result = await db
      .insert(cards)
      .values({
        lessonId: original.lessonId,
        cardType: original.cardType,
        frontContent: `${original.frontContent} (copie)`,
        backContent: original.backContent,
        question: original.question,
        options: original.options,
        correctAnswer: original.correctAnswer,
        explanation: original.explanation,
        hints: original.hints,
        timeLimit: original.timeLimit,
        points: original.points,
        difficulty: original.difficulty,
        displayOrder: Number(maxOrder) + 1,
      })
      .returning({
        id: cards.id,
        lessonId: cards.lessonId,
        cardType: cards.cardType,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        question: cards.question,
        options: cards.options,
        correctAnswer: cards.correctAnswer,
        explanation: cards.explanation,
        hints: cards.hints,
        timeLimit: cards.timeLimit,
        points: cards.points,
        difficulty: cards.difficulty,
        displayOrder: cards.displayOrder,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      })

    const card = result[0]
    if (!card) {
      throw new Error('Erreur lors de la duplication')
    }

    console.log(`[AUDIT] Card duplicated by ${context.email}:`, id, '->', card.id)

    return card
  })

// Get lessons for dropdown (simple list)
export const getLessonsSimple = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const lessonList = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        subjectId: lessons.subjectId,
      })
      .from(lessons)
      .orderBy(asc(lessons.displayOrder))

    return lessonList
  })


// Bulk create cards (for import)
export const bulkCreateCards = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { lessonId: number; cards: CreateCardInput[] }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { lessonId, cards: cardsToCreate } = data

    if (cardsToCreate.length === 0) {
      return { created: 0 }
    }

    // Get max display order for this lesson
    const maxOrderResult = await db
      .select({ max: sql<number>`COALESCE(MAX(${cards.displayOrder}), 0)` })
      .from(cards)
      .where(eq(cards.lessonId, lessonId))

    let currentOrder = Number(maxOrderResult[0]?.max ?? 0)

    // Insert cards with incremental display order
    const cardsWithOrder = cardsToCreate.map((card) => ({
      ...card,
      lessonId,
      displayOrder: ++currentOrder,
    }))

    const result = await db
      .insert(cards)
      .values(cardsWithOrder)
      .returning({ id: cards.id })

    console.log(`[AUDIT] Bulk cards created by ${context.email}: ${result.length} cards for lesson ${lessonId}`)

    return { created: result.length }
  })

// Bulk delete cards
export const bulkDeleteCards = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((ids: number[]) => ids)
  .handler(async ({ data: ids, context }) => {
    initAdminDb()
    const db = getDb()

    if (ids.length === 0) {
      return { deleted: 0 }
    }

    const result = await db
      .delete(cards)
      .where(sql`${cards.id} IN ${ids}`)
      .returning({ id: cards.id })

    console.log(`[AUDIT] Bulk cards deleted by ${context.email}: ${result.length} cards`)

    return { deleted: result.length }
  })
