import type { FunctionCallContext, RAGContext } from '@/lib/ai/gemini-client'
import type { BulkGenerateCardsInput, BulkGenerateTeachPlansInput, GenerateCardsInput, GenerateTeachPlanInput, SaveGeneratedCardsInput } from '@/lib/schemas'
import process from 'node:process'
import { and, asc, desc, eq, sql } from '@kurama/data-ops/database/drizzle-orm'
import { cards, grades, lessons, lessonsContentChunks, lessonsContentFile, series, subjects } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import {
  CARD_GENERATION_DEFAULTS,
  extractKeyConcepts,

  GEMINI_MODEL,
  generateCardsWithFunctionCalling,
  generateCardsWithRAG,
  generateCompleteCards,
  generateEmbedding,
  generateEmbeddings,
  generateLessonPlan,
  generateSearchQueries,
  RAG_THRESHOLDS,

  SIMILARITY_THRESHOLDS,
} from '@/lib/ai/gemini-client'
import { getDb, initAdminDb } from '@/lib/db'
import {
  bulkGenerateCardsSchema,
  bulkGenerateTeachPlansSchema,
  generateCardsSchema,

  generateTeachPlanSchema,

  saveGeneratedCardsSchema,
} from '@/lib/schemas'
import { adminMiddleware } from '../middleware/admin-auth'

// RAG helper types
interface ChunkSearchResult {
  id: number
  chunkText: string
  chunkIndex: number
  fileName: string
  pageNumber: number | null
  similarity: number
}

interface RankedChunk extends ChunkSearchResult {
  combinedScore: number
  keywordMatch: boolean
}

interface LessonChunk {
  chunkText: string
  fileName: string
  pageNumber: number | null
  chunkIndex: number
}

// RAG helper functions (inline to avoid package export issues)
async function getLessonChunkCount(db: ReturnType<typeof getDb>, lessonId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessonsContentChunks)
    .innerJoin(lessonsContentFile, eq(lessonsContentChunks.fileId, lessonsContentFile.id))
    .where(eq(lessonsContentFile.lessonId, lessonId))
  return Number(result[0]?.count ?? 0)
}

async function getLessonChunks(db: ReturnType<typeof getDb>, lessonId: number, limit?: number): Promise<LessonChunk[]> {
  let query = db
    .select({
      chunkText: lessonsContentChunks.chunkText,
      fileName: lessonsContentFile.fileName,
      pageNumber: lessonsContentChunks.pageNumber,
      chunkIndex: lessonsContentChunks.chunkIndex,
    })
    .from(lessonsContentChunks)
    .innerJoin(lessonsContentFile, eq(lessonsContentChunks.fileId, lessonsContentFile.id))
    .where(eq(lessonsContentFile.lessonId, lessonId))
    .orderBy(lessonsContentFile.id, lessonsContentChunks.chunkIndex)

  if (limit) {
    query = query.limit(limit) as typeof query
  }
  return await query
}

async function searchRelevantChunks(
  db: ReturnType<typeof getDb>,
  lessonId: number,
  queryEmbedding: number[],
  topK: number = 5,
): Promise<ChunkSearchResult[]> {
  const similarity = sql<number>`1 - (${lessonsContentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`

  const results = await db
    .select({
      id: lessonsContentChunks.id,
      chunkText: lessonsContentChunks.chunkText,
      chunkIndex: lessonsContentChunks.chunkIndex,
      pageNumber: lessonsContentChunks.pageNumber,
      fileName: lessonsContentFile.fileName,
      similarity,
    })
    .from(lessonsContentChunks)
    .innerJoin(lessonsContentFile, eq(lessonsContentChunks.fileId, lessonsContentFile.id))
    .where(eq(lessonsContentFile.lessonId, lessonId))
    .orderBy(desc(similarity))
    .limit(topK)

  return results
}

function deduplicateChunks(chunks: ChunkSearchResult[], similarityThreshold: number = SIMILARITY_THRESHOLDS.deduplication): ChunkSearchResult[] {
  const unique: ChunkSearchResult[] = []
  for (const chunk of chunks) {
    const isDuplicate = unique.some((existing) => {
      const words1 = new Set(existing.chunkText.toLowerCase().split(/\s+/))
      const words2 = new Set(chunk.chunkText.toLowerCase().split(/\s+/))
      const intersection = new Set([...words1].filter(w => words2.has(w)))
      const union = new Set([...words1, ...words2])
      return intersection.size / union.size > similarityThreshold
    })
    if (!isDuplicate)
      unique.push(chunk)
  }
  return unique
}

// Phase 4: Advanced search helpers
function calculateKeywordScore(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()
  const matches = keywords.filter(kw => lowerText.includes(kw.toLowerCase()))
  return keywords.length > 0 ? matches.length / keywords.length : 0
}

async function hybridSearch(
  db: ReturnType<typeof getDb>,
  lessonId: number,
  queryEmbedding: number[],
  keywords: string[],
  options: { vectorTopK?: number, keywordTopK?: number, vectorWeight?: number, minSimilarity?: number } = {},
): Promise<RankedChunk[]> {
  const {
    vectorTopK = 10,
    vectorWeight = 0.7,
    minSimilarity = SIMILARITY_THRESHOLDS.minSimilarity,
  } = options

  // Vector search
  const vectorResults = await searchRelevantChunks(db, lessonId, queryEmbedding, vectorTopK)

  // Merge with keyword scoring
  const chunkMap = new Map<number, RankedChunk>()

  for (const chunk of vectorResults) {
    if (chunk.similarity < minSimilarity)
      continue

    const keywordScore = calculateKeywordScore(chunk.chunkText, keywords)
    const keywordWeight = 1 - vectorWeight

    chunkMap.set(chunk.id, {
      ...chunk,
      combinedScore: chunk.similarity * vectorWeight + keywordScore * keywordWeight,
      keywordMatch: keywordScore > 0,
    })
  }

  return Array.from(chunkMap.values())
    .sort((a, b) => b.combinedScore - a.combinedScore)
}

function selectDiverseChunks(
  chunks: ChunkSearchResult[],
  targetCount: number,
): ChunkSearchResult[] {
  if (chunks.length <= targetCount)
    return chunks

  const selected: ChunkSearchResult[] = []
  const remaining = [...chunks]

  // Always include the top result
  const first = remaining.shift()
  if (first) {
    selected.push(first)
  }

  // Greedily select diverse chunks
  while (selected.length < targetCount && remaining.length > 0) {
    let bestIdx = 0
    let bestScore = -1

    for (let i = 0; i < remaining.length; i++) {
      const current = remaining[i]
      if (!current)
        continue

      // Calculate max overlap with selected chunks
      const maxOverlap = Math.max(
        ...selected.map((s) => {
          const words1 = new Set(s.chunkText.toLowerCase().split(/\s+/))
          const words2 = new Set(current.chunkText.toLowerCase().split(/\s+/))
          const intersection = new Set([...words1].filter(w => words2.has(w)))
          const union = new Set([...words1, ...words2])
          return intersection.size / union.size
        }),
      )

      const diversity = 1 - maxOverlap
      const score = diversity * 0.4 + current.similarity * 0.6

      if (score > bestScore) {
        bestScore = score
        bestIdx = i
      }
    }

    const candidate = remaining[bestIdx]
    if (candidate) {
      selected.push(candidate)
    }
    remaining.splice(bestIdx, 1)
  }

  return selected
}

// Get API key from environment
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurée. Veuillez ajouter la clé API dans les variables d\'environnement.')
  }
  return apiKey
}

// Generate teach plan for a lesson
export const generateTeachPlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: GenerateTeachPlanInput) => generateTeachPlanSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()
    const apiKey = getGeminiApiKey()

    // Get lesson with subject info
    const lessonResult = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        subjectName: subjects.name,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(lessons.id, data.lessonId))
      .limit(1)

    const lesson = lessonResult[0]
    if (!lesson) {
      throw new Error('Leçon non trouvée')
    }

    // Generate lesson plan using AI
    const result = await generateLessonPlan(apiKey, {
      country: data.country,
      subject: lesson.subjectName || 'Matière',
      grade: data.grade,
      language: data.language,
      schoolYear: data.schoolYear,
      lessonTitle: lesson.title,
      customInstructions: data.customInstructions,
    })

    // Save to database
    const metadata = {
      country: data.country,
      grade: data.grade,
      language: data.language,
      sources: result.sources,
      generatedBy: GEMINI_MODEL,
    }

    const updateResult = await db
      .update(lessons)
      .set({
        teachPlan: result.content,
        teachPlanGeneratedAt: new Date().toISOString(),
        teachPlanMetadata: metadata,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, data.lessonId))
      .returning({
        id: lessons.id,
        teachPlan: lessons.teachPlan,
        teachPlanGeneratedAt: lessons.teachPlanGeneratedAt,
        teachPlanMetadata: lessons.teachPlanMetadata,
      })

    const updated = updateResult[0]
    console.warn(`[AUDIT] Teach plan generated by ${context.email} for lesson:`, data.lessonId)

    return {
      success: true,
      lesson: updated,
      sources: result.sources,
    }
  })

// Use centralized thresholds from constants
const VECTOR_SEARCH_THRESHOLD = RAG_THRESHOLDS.directLoad
const ADVANCED_SEARCH_THRESHOLD = RAG_THRESHOLDS.vectorSearch

// Generate complete cards from teach plan with RAG
export const generateCardsFromPlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: GenerateCardsInput) => generateCardsSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()
    const apiKey = getGeminiApiKey()

    // Get lesson with teach plan and metadata
    const lessonResult = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        teachPlan: lessons.teachPlan,
        difficulty: lessons.difficulty,
        subjectName: subjects.name,
        gradeName: grades.name,
        seriesName: series.name,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .leftJoin(series, eq(lessons.seriesId, series.id))
      .where(eq(lessons.id, data.lessonId))
      .limit(1)

    const lesson = lessonResult[0]
    if (!lesson) {
      throw new Error('Leçon non trouvée')
    }

    if (!lesson.teachPlan) {
      throw new Error('Cette leçon n\'a pas de plan d\'enseignement. Veuillez d\'abord générer un plan.')
    }

    // Check for attachment chunks (RAG context)
    const chunkCount = await getLessonChunkCount(db, data.lessonId)
    console.warn(`[RAG] Lesson ${data.lessonId} has ${chunkCount} chunks`)

    let attachmentChunks: { text: string, source: string, pageNumber?: number | null }[] = []
    let searchStrategy = 'none'

    if (chunkCount > 0) {
      if (chunkCount > ADVANCED_SEARCH_THRESHOLD) {
        // Phase 4: Advanced multi-query search with hybrid retrieval
        searchStrategy = 'advanced'
        console.warn(`[RAG] Using ADVANCED search (${chunkCount} chunks > ${ADVANCED_SEARCH_THRESHOLD})`)

        // Generate multiple diverse search queries from lesson plan
        const searchQueries = await generateSearchQueries(apiKey, lesson.teachPlan, 5)
        console.warn(`[RAG] Generated ${searchQueries.length} search queries`)

        // Extract keywords for hybrid search
        const keyConcepts = await extractKeyConcepts(apiKey, lesson.teachPlan, 8)
        const keywords = keyConcepts.flatMap(c => c.toLowerCase().split(/\s+/))
        console.warn(`[RAG] Extracted ${keywords.length} keywords for hybrid search`)

        // Generate embeddings for all queries in batch
        const queryEmbeddings = await generateEmbeddings(apiKey, searchQueries)
        console.warn(`[RAG] Generated ${queryEmbeddings.length} query embeddings`)

        // Multi-query search with result fusion
        const allResults: ChunkSearchResult[] = []
        for (const { embedding } of queryEmbeddings) {
          if (embedding.length === 0)
            continue

          // Hybrid search combining vector + keyword
          const results = await hybridSearch(db, data.lessonId, embedding, keywords, {
            vectorTopK: 5,
            vectorWeight: 0.7,
            minSimilarity: 0.25,
          })
          allResults.push(...results)
        }

        // Deduplicate and select diverse chunks
        const uniqueChunks = deduplicateChunks(allResults, 0.8)
        const diverseChunks = selectDiverseChunks(uniqueChunks, 12)

        console.warn(`[RAG] Advanced search: ${allResults.length} total → ${uniqueChunks.length} unique → ${diverseChunks.length} diverse`)

        attachmentChunks = diverseChunks.map(c => ({
          text: c.chunkText,
          source: c.fileName,
          pageNumber: c.pageNumber,
        }))
      }
      else if (chunkCount > VECTOR_SEARCH_THRESHOLD) {
        // Standard vector search for medium document sets
        searchStrategy = 'vector'
        console.warn(`[RAG] Using vector search (${chunkCount} chunks > ${VECTOR_SEARCH_THRESHOLD})`)

        // Extract key concepts from lesson plan
        const keyConcepts = await extractKeyConcepts(apiKey, lesson.teachPlan, 5)
        console.warn(`[RAG] Extracted concepts:`, keyConcepts)

        // Vector search for each concept
        const allResults: ChunkSearchResult[] = []
        for (const concept of keyConcepts) {
          try {
            const embedding = await generateEmbedding(apiKey, concept)
            const results = await searchRelevantChunks(db, data.lessonId, embedding, 3)
            allResults.push(...results)
          }
          catch (err) {
            console.warn(`[RAG] Failed to search for concept "${concept}":`, err)
          }
        }

        // Deduplicate and limit
        const uniqueChunks = deduplicateChunks(allResults, 0.85)
        attachmentChunks = uniqueChunks.slice(0, 10).map(c => ({
          text: c.chunkText,
          source: c.fileName,
          pageNumber: c.pageNumber,
        }))
      }
      else {
        // Load all chunks for smaller document sets
        searchStrategy = 'direct'
        console.warn(`[RAG] Loading all ${chunkCount} chunks directly`)
        const chunks = await getLessonChunks(db, data.lessonId, 10)
        attachmentChunks = chunks.map(c => ({
          text: c.chunkText,
          source: c.fileName,
          pageNumber: c.pageNumber,
        }))
      }
    }

    // Build RAG context
    const ragContext: RAGContext = {
      lessonPlan: lesson.teachPlan,
      attachmentChunks,
      metadata: {
        subject: lesson.subjectName || 'Non spécifié',
        grade: lesson.gradeName ?? undefined,
        series: lesson.seriesName ?? undefined,
        difficulty: lesson.difficulty ?? undefined,
        lessonTitle: lesson.title,
      },
    }

    // Generate cards with RAG if we have chunks, otherwise use standard generation
    const completeCards = attachmentChunks.length > 0
      ? await generateCardsWithRAG(apiKey, ragContext, data.amount)
      : await generateCompleteCards(apiKey, lesson.teachPlan, data.amount)

    console.warn(`[AUDIT] ${completeCards.length} cards generated by ${context.email} for lesson ${data.lessonId} (strategy: ${searchStrategy}, chunks: ${attachmentChunks.length})`)

    return {
      success: true,
      usedRAG: attachmentChunks.length > 0,
      searchStrategy,
      chunksUsed: attachmentChunks.length,
      cards: completeCards.map((card, index) => {
        const correctOption = card.options.find((o: { id: string, text: string, isCorrect: boolean }) => o.isCorrect)
        return {
          lessonId: data.lessonId,
          cardType: 'multichoice' as const,
          frontContent: card.frontContent,
          backContent: card.backContent,
          question: card.question,
          options: card.options,
          correctAnswer: correctOption?.text || '',
          explanation: card.explanation,
          hints: card.hints,
          displayOrder: index + 1,
          points: card.difficulty === 2 ? CARD_GENERATION_DEFAULTS.points.hard : card.difficulty === 1 ? CARD_GENERATION_DEFAULTS.points.medium : CARD_GENERATION_DEFAULTS.points.easy,
          difficulty: card.difficulty ?? 0,
          metadata: {
            sourceReference: card.sourceReference,
            bloomsLevel: card.bloomsLevel,
          },
        }
      }),
    }
  })

// Save generated cards to database
export const saveGeneratedCards = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: SaveGeneratedCardsInput) => saveGeneratedCardsSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    // Get current max display order for this lesson
    const maxOrderResult = await db
      .select({ max: cards.displayOrder })
      .from(cards)
      .where(eq(cards.lessonId, data.lessonId))
      .orderBy(cards.displayOrder)
      .limit(1)

    let startOrder = (maxOrderResult[0]?.max || 0) + 1

    // Insert all cards
    const insertedCards: Array<{
      id: number
      lessonId: number
      cardType: string
      frontContent: string
      backContent: string
    }> = []

    for (const card of data.cards) {
      const result = await db
        .insert(cards)
        .values({
          ...card,
          displayOrder: startOrder++,
        })
        .returning({
          id: cards.id,
          lessonId: cards.lessonId,
          cardType: cards.cardType,
          frontContent: cards.frontContent,
          backContent: cards.backContent,
        })

      if (result[0]) {
        insertedCards.push(result[0])
      }
    }

    console.warn(`[AUDIT] ${insertedCards.length} cards saved by ${context.email} for lesson:`, data.lessonId)

    return {
      success: true,
      savedCount: insertedCards.length,
    }
  })

// Update teach plan manually
export const updateTeachPlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { lessonId: number, teachPlan: string }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .update(lessons)
      .set({
        teachPlan: data.teachPlan,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, data.lessonId))
      .returning({
        id: lessons.id,
        teachPlan: lessons.teachPlan,
      })

    const updated = result[0]
    if (!updated) {
      throw new Error('Leçon non trouvée')
    }

    console.warn(`[AUDIT] Teach plan updated manually by ${context.email} for lesson:`, data.lessonId)

    return { success: true, lesson: updated }
  })

// ============================================================================
// Phase 5: Function Calling for Dynamic Context Retrieval
// ============================================================================

// Use centralized threshold from constants
const FUNCTION_CALLING_THRESHOLD = RAG_THRESHOLDS.functionCalling

/**
 * Generate cards using function calling for dynamic context retrieval
 * Best for very large document sets where the model needs to explore
 */
export const generateCardsWithDynamicContext = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: GenerateCardsInput) => generateCardsSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()
    const apiKey = getGeminiApiKey()

    // Get lesson with teach plan and metadata
    const lessonResult = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        teachPlan: lessons.teachPlan,
        difficulty: lessons.difficulty,
        subjectName: subjects.name,
        gradeName: grades.name,
        seriesName: series.name,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .leftJoin(series, eq(lessons.seriesId, series.id))
      .where(eq(lessons.id, data.lessonId))
      .limit(1)

    const lesson = lessonResult[0]
    if (!lesson) {
      throw new Error('Leçon non trouvée')
    }

    if (!lesson.teachPlan) {
      throw new Error('Cette leçon n\'a pas de plan d\'enseignement. Veuillez d\'abord générer un plan.')
    }

    // Check for attachment chunks
    const chunkCount = await getLessonChunkCount(db, data.lessonId)
    console.warn(`[FunctionCalling] Lesson ${data.lessonId} has ${chunkCount} chunks`)

    if (chunkCount === 0) {
      throw new Error('Cette leçon n\'a pas de documents attachés. Le mode function calling nécessite des documents.')
    }

    // Build function call context with database query functions
    const functionCallContext: FunctionCallContext = {
      lessonId: data.lessonId,
      apiKey,
      metadata: {
        subject: lesson.subjectName || 'Non spécifié',
        grade: lesson.gradeName ?? undefined,
        series: lesson.seriesName ?? undefined,
        difficulty: lesson.difficulty ?? undefined,
        lessonTitle: lesson.title,
      },
      // Search chunks function
      searchChunks: async (query: string, topK: number) => {
        try {
          const embedding = await generateEmbedding(apiKey, query)
          const results = await searchRelevantChunks(db, data.lessonId, embedding, topK)
          return results.map(r => ({
            text: r.chunkText,
            source: r.fileName,
            pageNumber: r.pageNumber,
            similarity: r.similarity,
          }))
        }
        catch (err) {
          console.error('[FunctionCalling] Search error:', err)
          return []
        }
      },
      // Get chunks by file function
      getChunksByFile: async (fileName: string, pageNumber?: number) => {
        try {
          const query = db
            .select({
              chunkText: lessonsContentChunks.chunkText,
              pageNumber: lessonsContentChunks.pageNumber,
            })
            .from(lessonsContentChunks)
            .innerJoin(lessonsContentFile, eq(lessonsContentChunks.fileId, lessonsContentFile.id))
            .where(eq(lessonsContentFile.fileName, fileName))
            .orderBy(lessonsContentChunks.chunkIndex)
            .limit(5)

          const results = await query

          // Filter by page number if provided
          const filtered = pageNumber
            ? results.filter(r => r.pageNumber === pageNumber || r.pageNumber === pageNumber - 1 || r.pageNumber === pageNumber + 1)
            : results

          return filtered.map(r => ({
            text: r.chunkText,
            pageNumber: r.pageNumber,
          }))
        }
        catch (err) {
          console.error('[FunctionCalling] Get chunks by file error:', err)
          return []
        }
      },
    }

    // Generate cards with function calling
    console.warn(`[FunctionCalling] Starting generation with dynamic context retrieval`)
    const { cards: generatedCards, functionCalls } = await generateCardsWithFunctionCalling(
      apiKey,
      lesson.teachPlan,
      data.amount,
      functionCallContext,
    )

    console.warn(`[AUDIT] ${generatedCards.length} cards generated by ${context.email} for lesson ${data.lessonId} (strategy: function-calling, calls: ${functionCalls.length})`)

    return {
      success: true,
      usedRAG: true,
      searchStrategy: 'function-calling',
      functionCallsCount: functionCalls.length,
      functionCalls,
      cards: generatedCards.map((card, index) => {
        const correctOption = card.options.find((o: { id: string, text: string, isCorrect: boolean }) => o.isCorrect)
        return {
          lessonId: data.lessonId,
          cardType: 'multichoice' as const,
          frontContent: card.frontContent,
          backContent: card.backContent,
          question: card.question,
          options: card.options,
          correctAnswer: correctOption?.text || '',
          explanation: card.explanation,
          hints: card.hints,
          displayOrder: index + 1,
          points: card.difficulty === 2 ? CARD_GENERATION_DEFAULTS.points.hard : card.difficulty === 1 ? CARD_GENERATION_DEFAULTS.points.medium : CARD_GENERATION_DEFAULTS.points.easy,
          difficulty: card.difficulty ?? 0,
          metadata: {
            sourceReference: card.sourceReference,
            bloomsLevel: card.bloomsLevel,
          },
        }
      }),
    }
  })

/**
 * Smart card generation that automatically selects the best strategy
 * based on document size and complexity
 */
export const generateCardsAuto = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: GenerateCardsInput & { preferFunctionCalling?: boolean }) => data)
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    // Check chunk count to determine strategy
    const chunkCount = await getLessonChunkCount(db, data.lessonId)

    // Determine best strategy
    let strategy: 'standard' | 'function-calling'

    if (data.preferFunctionCalling && chunkCount > 0) {
      strategy = 'function-calling'
    }
    else if (chunkCount > FUNCTION_CALLING_THRESHOLD) {
      strategy = 'function-calling'
    }
    else {
      strategy = 'standard'
    }

    console.warn(`[AutoGenerate] Selected strategy: ${strategy} (chunks: ${chunkCount}, preferFC: ${data.preferFunctionCalling})`)

    // Build the input with required cardType
    const input: GenerateCardsInput = {
      lessonId: data.lessonId,
      cardType: data.cardType,
      amount: data.amount,
    }

    // Route to appropriate handler
    if (strategy === 'function-calling') {
      return generateCardsWithDynamicContext({ data: input })
    }
    else {
      return generateCardsFromPlan({ data: input })
    }
  })

/**
 * Bulk generate lesson plans for all lessons without teach plans
 * Processes lessons in parallel with concurrency control
 */
export const bulkGenerateTeachPlans = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: BulkGenerateTeachPlansInput) => bulkGenerateTeachPlansSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()
    const apiKey = getGeminiApiKey()

    // Get lessons without teach plans
    const conditions = [sql`${lessons.teachPlan} IS NULL`]
    if (data.subjectId) {
      conditions.push(eq(lessons.subjectId, data.subjectId))
    }
    if (data.gradeId) {
      conditions.push(eq(lessons.gradeId, data.gradeId))
    }

    const lessonsToProcess = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        subjectName: subjects.name,
        gradeName: grades.name,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .where(and(...conditions))
      .orderBy(asc(lessons.displayOrder))

    if (lessonsToProcess.length === 0) {
      return {
        success: true,
        message: 'Aucune leçon sans plan d\'enseignement trouvée',
        processed: 0,
        results: [],
      }
    }

    console.warn(`[BulkGenerate] Starting bulk generation for ${lessonsToProcess.length} lessons by ${context.email}`)

    // Process lessons in parallel with concurrency control (max 3 concurrent)
    const concurrency = 3
    const results: Array<{ lessonId: number, title: string, success: boolean, error?: string }> = []

    for (let i = 0; i < lessonsToProcess.length; i += concurrency) {
      const batch = lessonsToProcess.slice(i, i + concurrency)

      const batchPromises = batch.map(async (lesson) => {
        try {
          const grade = lesson.gradeName || 'Non spécifié'

          const result = await generateLessonPlan(apiKey, {
            country: data.country,
            subject: lesson.subjectName || 'Matière',
            grade,
            language: data.language,
            schoolYear: data.schoolYear,
            lessonTitle: lesson.title,
            customInstructions: data.customInstructions,
          })

          // Save to database
          const metadata = {
            country: data.country,
            grade,
            language: data.language,
            sources: result.sources,
            generatedBy: GEMINI_MODEL,
            bulkGenerated: true,
          }

          await db
            .update(lessons)
            .set({
              teachPlan: result.content,
              teachPlanGeneratedAt: new Date().toISOString(),
              teachPlanMetadata: metadata,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(lessons.id, lesson.id))

          console.warn(`[BulkGenerate] Success for lesson ${lesson.id}: ${lesson.title}`)

          return {
            lessonId: lesson.id,
            title: lesson.title,
            success: true,
          }
        }
        catch (error) {
          console.error(`[BulkGenerate] Error for lesson ${lesson.id}:`, error)

          return {
            lessonId: lesson.id,
            title: lesson.title,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add delay between batches to respect rate limits
      if (i + concurrency < lessonsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    console.warn(`[AUDIT] Bulk generation completed by ${context.email}: ${successCount} success, ${errorCount} errors`)

    return {
      success: true,
      message: `Génération terminée: ${successCount} réussies, ${errorCount} échouées`,
      processed: results.length,
      successCount,
      errorCount,
      results,
    }
  })

/**
 * Extract recommended card count from teach plan content
 * Looks for patterns like "Nombre de cartes suggéré: X cartes" or similar
 */
function extractRecommendedCardCount(teachPlan: string): number {
  // Try multiple patterns to find the recommended card count
  const patterns = [
    /Nombre de cartes suggéré\s*:\s*(\d+)/i,
    /(\d+)\s*cartes?\s*\(basé sur/i,
    /Nombre de cartes\s*:\s*(\d+)/i,
    /suggéré\s*:\s*(\d+)\s*cartes?/i,
  ]

  for (const pattern of patterns) {
    const match = teachPlan.match(pattern)
    if (match && match[1]) {
      const count = Number.parseInt(match[1], 10)
      if (count >= 5 && count <= 30) {
        return count
      }
    }
  }

  // Default to 10 cards if no recommendation found
  return 10
}

/**
 * Bulk generate cards for all lessons that have teach plans but no cards
 * Extracts recommended card count from each lesson's teach plan
 */
export const bulkGenerateCards = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: BulkGenerateCardsInput) => bulkGenerateCardsSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()
    const apiKey = getGeminiApiKey()

    // Get lessons with teach plans but no cards
    const conditions = [
      sql`${lessons.teachPlan} IS NOT NULL`,
      sql`(SELECT COUNT(*) FROM "cards" WHERE "cards"."lesson_id" = "lessons"."id") = 0`,
    ]
    if (data.subjectId) {
      conditions.push(eq(lessons.subjectId, data.subjectId))
    }
    if (data.gradeId) {
      conditions.push(eq(lessons.gradeId, data.gradeId))
    }

    const lessonsToProcess = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        teachPlan: lessons.teachPlan,
        subjectName: subjects.name,
        gradeName: grades.name,
        seriesName: series.name,
        difficulty: lessons.difficulty,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .leftJoin(series, eq(lessons.seriesId, series.id))
      .where(and(...conditions))
      .orderBy(asc(lessons.displayOrder))

    if (lessonsToProcess.length === 0) {
      return {
        success: true,
        message: 'Aucune leçon éligible trouvée (avec plan IA et sans cartes)',
        processed: 0,
        results: [],
      }
    }

    console.warn(`[BulkCards] Starting bulk card generation for ${lessonsToProcess.length} lessons by ${context.email}`)

    // Process lessons sequentially to avoid overwhelming the API
    const concurrency = 2
    const results: Array<{
      lessonId: number
      title: string
      success: boolean
      cardsGenerated?: number
      recommendedCount?: number
      error?: string
    }> = []

    for (let i = 0; i < lessonsToProcess.length; i += concurrency) {
      const batch = lessonsToProcess.slice(i, i + concurrency)

      const batchPromises = batch.map(async (lesson) => {
        try {
          if (!lesson.teachPlan) {
            return {
              lessonId: lesson.id,
              title: lesson.title,
              success: false,
              error: 'Pas de plan d\'enseignement',
            }
          }

          // Extract recommended card count from teach plan
          const recommendedCount = extractRecommendedCardCount(lesson.teachPlan)
          const amount = Math.min(Math.max(recommendedCount, 5), 30) // Clamp between 5 and 30

          console.warn(`[BulkCards] Lesson ${lesson.id}: "${lesson.title}" - Generating ${amount} cards (recommended: ${recommendedCount})`)

          // Check for attachment chunks (RAG context)
          const chunkCount = await getLessonChunkCount(db, lesson.id)

          let attachmentChunks: { text: string, source: string, pageNumber?: number | null }[] = []

          if (chunkCount > 0 && chunkCount <= RAG_THRESHOLDS.directLoad) {
            // Load all chunks for smaller document sets
            const chunks = await getLessonChunks(db, lesson.id, 10)
            attachmentChunks = chunks.map(c => ({
              text: c.chunkText,
              source: c.fileName,
              pageNumber: c.pageNumber,
            }))
          }

          // Build RAG context
          const ragContext: RAGContext = {
            lessonPlan: lesson.teachPlan,
            attachmentChunks,
            metadata: {
              subject: lesson.subjectName || 'Non spécifié',
              grade: lesson.gradeName ?? undefined,
              series: lesson.seriesName ?? undefined,
              difficulty: lesson.difficulty ?? undefined,
              lessonTitle: lesson.title,
            },
          }

          // Generate cards
          const generatedCards = attachmentChunks.length > 0
            ? await generateCardsWithRAG(apiKey, ragContext, amount)
            : await generateCompleteCards(apiKey, lesson.teachPlan, amount)

          // Save cards to database
          let startOrder = 1
          for (const card of generatedCards) {
            const correctOption = card.options.find((o: { id: string, text: string, isCorrect: boolean }) => o.isCorrect)

            await db
              .insert(cards)
              .values({
                lessonId: lesson.id,
                cardType: 'multichoice',
                frontContent: card.frontContent,
                backContent: card.backContent,
                question: card.question,
                options: card.options,
                correctAnswer: correctOption?.text || '',
                explanation: card.explanation,
                hints: card.hints,
                displayOrder: startOrder++,
                points: card.difficulty === 2 ? CARD_GENERATION_DEFAULTS.points.hard : card.difficulty === 1 ? CARD_GENERATION_DEFAULTS.points.medium : CARD_GENERATION_DEFAULTS.points.easy,
                difficulty: card.difficulty ?? 0,
              })
          }

          console.warn(`[BulkCards] Success for lesson ${lesson.id}: ${generatedCards.length} cards created`)

          return {
            lessonId: lesson.id,
            title: lesson.title,
            success: true,
            cardsGenerated: generatedCards.length,
            recommendedCount,
          }
        }
        catch (error) {
          console.error(`[BulkCards] Error for lesson ${lesson.id}:`, error)

          return {
            lessonId: lesson.id,
            title: lesson.title,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add delay between batches to respect rate limits
      if (i + concurrency < lessonsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    const totalCards = results.reduce((sum, r) => sum + (r.cardsGenerated || 0), 0)

    console.warn(`[AUDIT] Bulk card generation completed by ${context.email}: ${successCount} lessons, ${totalCards} cards, ${errorCount} errors`)

    return {
      success: true,
      message: `Génération terminée: ${successCount} leçons traitées, ${totalCards} cartes créées, ${errorCount} erreurs`,
      processed: results.length,
      successCount,
      errorCount,
      totalCards,
      results,
    }
  })
