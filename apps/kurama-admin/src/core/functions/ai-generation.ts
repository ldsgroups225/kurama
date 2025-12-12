import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql } from '@kurama/data-ops/database/drizzle-orm'
import { lessons, subjects, grades, series, cards, lessonsContentChunks, lessonsContentFile } from '@kurama/data-ops/drizzle/schema'
import { adminMiddleware } from '../middleware/admin-auth'
import { initAdminDb, getDb } from '@/lib/db'
import {
  generateTeachPlanSchema,
  generateCardsSchema,
  saveGeneratedCardsSchema,
  type GenerateTeachPlanInput,
  type GenerateCardsInput,
  type SaveGeneratedCardsInput,
} from '@/lib/schemas'
import {
  generateLessonPlan,
  generateCompleteCards,
  generateCardsWithRAG,
  generateCardsWithFunctionCalling,
  generateEmbedding,
  generateEmbeddings,
  extractKeyConcepts,
  generateSearchQueries,
  type RAGContext,
  type FunctionCallContext,
} from '@/lib/ai/gemini-client'

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
  topK: number = 5
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

function deduplicateChunks(chunks: ChunkSearchResult[], similarityThreshold: number = 0.95): ChunkSearchResult[] {
  const unique: ChunkSearchResult[] = []
  for (const chunk of chunks) {
    const isDuplicate = unique.some(existing => {
      const words1 = new Set(existing.chunkText.toLowerCase().split(/\s+/))
      const words2 = new Set(chunk.chunkText.toLowerCase().split(/\s+/))
      const intersection = new Set([...words1].filter(w => words2.has(w)))
      const union = new Set([...words1, ...words2])
      return intersection.size / union.size > similarityThreshold
    })
    if (!isDuplicate) unique.push(chunk)
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
  options: { vectorTopK?: number; keywordTopK?: number; vectorWeight?: number; minSimilarity?: number } = {}
): Promise<RankedChunk[]> {
  const {
    vectorTopK = 10,
    vectorWeight = 0.7,
    minSimilarity = 0.3,
  } = options

  // Vector search
  const vectorResults = await searchRelevantChunks(db, lessonId, queryEmbedding, vectorTopK)

  // Merge with keyword scoring
  const chunkMap = new Map<number, RankedChunk>()

  for (const chunk of vectorResults) {
    if (chunk.similarity < minSimilarity) continue

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
  targetCount: number
): ChunkSearchResult[] {
  if (chunks.length <= targetCount) return chunks

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
      if (!current) continue

      // Calculate max overlap with selected chunks
      const maxOverlap = Math.max(
        ...selected.map(s => {
          const words1 = new Set(s.chunkText.toLowerCase().split(/\s+/))
          const words2 = new Set(current.chunkText.toLowerCase().split(/\s+/))
          const intersection = new Set([...words1].filter(w => words2.has(w)))
          const union = new Set([...words1, ...words2])
          return intersection.size / union.size
        })
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
      generatedBy: 'gemini-2.5-flash',
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
    console.log(`[AUDIT] Teach plan generated by ${context.email} for lesson:`, data.lessonId)

    return {
      success: true,
      lesson: updated,
      sources: result.sources,
    }
  })

// Thresholds for RAG strategy selection
const VECTOR_SEARCH_THRESHOLD = 10
const ADVANCED_SEARCH_THRESHOLD = 30

// Generate complete cards from teach plan with RAG enhancement
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
      throw new Error("Cette leçon n'a pas de plan d'enseignement. Veuillez d'abord générer un plan.")
    }

    // Check for attachment chunks (RAG context)
    const chunkCount = await getLessonChunkCount(db, data.lessonId)
    console.log(`[RAG] Lesson ${data.lessonId} has ${chunkCount} chunks`)

    let attachmentChunks: { text: string; source: string; pageNumber?: number | null }[] = []
    let searchStrategy = 'none'

    if (chunkCount > 0) {
      if (chunkCount > ADVANCED_SEARCH_THRESHOLD) {
        // Phase 4: Advanced multi-query search with hybrid retrieval
        searchStrategy = 'advanced'
        console.log(`[RAG] Using ADVANCED search (${chunkCount} chunks > ${ADVANCED_SEARCH_THRESHOLD})`)

        // Generate multiple diverse search queries from lesson plan
        const searchQueries = await generateSearchQueries(apiKey, lesson.teachPlan, 5)
        console.log(`[RAG] Generated ${searchQueries.length} search queries`)

        // Extract keywords for hybrid search
        const keyConcepts = await extractKeyConcepts(apiKey, lesson.teachPlan, 8)
        const keywords = keyConcepts.flatMap(c => c.toLowerCase().split(/\s+/))
        console.log(`[RAG] Extracted ${keywords.length} keywords for hybrid search`)

        // Generate embeddings for all queries in batch
        const queryEmbeddings = await generateEmbeddings(apiKey, searchQueries)
        console.log(`[RAG] Generated ${queryEmbeddings.length} query embeddings`)

        // Multi-query search with result fusion
        const allResults: ChunkSearchResult[] = []
        for (const { embedding } of queryEmbeddings) {
          if (embedding.length === 0) continue

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

        console.log(`[RAG] Advanced search: ${allResults.length} total → ${uniqueChunks.length} unique → ${diverseChunks.length} diverse`)

        attachmentChunks = diverseChunks.map(c => ({
          text: c.chunkText,
          source: c.fileName,
          pageNumber: c.pageNumber,
        }))

      } else if (chunkCount > VECTOR_SEARCH_THRESHOLD) {
        // Standard vector search for medium document sets
        searchStrategy = 'vector'
        console.log(`[RAG] Using vector search (${chunkCount} chunks > ${VECTOR_SEARCH_THRESHOLD})`)

        // Extract key concepts from lesson plan
        const keyConcepts = await extractKeyConcepts(apiKey, lesson.teachPlan, 5)
        console.log(`[RAG] Extracted concepts:`, keyConcepts)

        // Vector search for each concept
        const allResults: ChunkSearchResult[] = []
        for (const concept of keyConcepts) {
          try {
            const embedding = await generateEmbedding(apiKey, concept)
            const results = await searchRelevantChunks(db, data.lessonId, embedding, 3)
            allResults.push(...results)
          } catch (err) {
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
      } else {
        // Load all chunks for smaller document sets
        searchStrategy = 'direct'
        console.log(`[RAG] Loading all ${chunkCount} chunks directly`)
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

    console.log(`[AUDIT] ${completeCards.length} cards generated by ${context.email} for lesson ${data.lessonId} (strategy: ${searchStrategy}, chunks: ${attachmentChunks.length})`)

    return {
      success: true,
      usedRAG: attachmentChunks.length > 0,
      searchStrategy,
      chunksUsed: attachmentChunks.length,
      cards: completeCards.map((card, index) => {
        const correctOption = card.options.find((o: { id: string; text: string; isCorrect: boolean }) => o.isCorrect)
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
          points: card.difficulty === 2 ? 15 : card.difficulty === 1 ? 12 : 10,
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

    console.log(`[AUDIT] ${insertedCards.length} cards saved by ${context.email} for lesson:`, data.lessonId)

    return {
      success: true,
      savedCount: insertedCards.length,
    }
  })

// Update teach plan manually
export const updateTeachPlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { lessonId: number; teachPlan: string }) => data)
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

    console.log(`[AUDIT] Teach plan updated manually by ${context.email} for lesson:`, data.lessonId)

    return { success: true, lesson: updated }
  })

// ============================================================================
// Phase 5: Function Calling for Dynamic Context Retrieval
// ============================================================================

// Threshold for using function calling (very large document sets)
const FUNCTION_CALLING_THRESHOLD = 50

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
      throw new Error("Cette leçon n'a pas de plan d'enseignement. Veuillez d'abord générer un plan.")
    }

    // Check for attachment chunks
    const chunkCount = await getLessonChunkCount(db, data.lessonId)
    console.log(`[FunctionCalling] Lesson ${data.lessonId} has ${chunkCount} chunks`)

    if (chunkCount === 0) {
      throw new Error("Cette leçon n'a pas de documents attachés. Le mode function calling nécessite des documents.")
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
        } catch (err) {
          console.error('[FunctionCalling] Search error:', err)
          return []
        }
      },
      // Get chunks by file function
      getChunksByFile: async (fileName: string, pageNumber?: number) => {
        try {
          let query = db
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
        } catch (err) {
          console.error('[FunctionCalling] Get chunks by file error:', err)
          return []
        }
      },
    }

    // Generate cards with function calling
    console.log(`[FunctionCalling] Starting generation with dynamic context retrieval`)
    const { cards: generatedCards, functionCalls } = await generateCardsWithFunctionCalling(
      apiKey,
      lesson.teachPlan,
      data.amount,
      functionCallContext
    )

    console.log(`[AUDIT] ${generatedCards.length} cards generated by ${context.email} for lesson ${data.lessonId} (strategy: function-calling, calls: ${functionCalls.length})`)

    return {
      success: true,
      usedRAG: true,
      searchStrategy: 'function-calling',
      functionCallsCount: functionCalls.length,
      functionCalls,
      cards: generatedCards.map((card, index) => {
        const correctOption = card.options.find((o: { id: string; text: string; isCorrect: boolean }) => o.isCorrect)
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
          points: card.difficulty === 2 ? 15 : card.difficulty === 1 ? 12 : 10,
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
    } else if (chunkCount > FUNCTION_CALLING_THRESHOLD) {
      strategy = 'function-calling'
    } else {
      strategy = 'standard'
    }

    console.log(`[AutoGenerate] Selected strategy: ${strategy} (chunks: ${chunkCount}, preferFC: ${data.preferFunctionCalling})`)

    // Build the input with required cardType
    const input: GenerateCardsInput = {
      lessonId: data.lessonId,
      cardType: data.cardType,
      amount: data.amount,
    }

    // Route to appropriate handler
    if (strategy === 'function-calling') {
      return generateCardsWithDynamicContext({ data: input })
    } else {
      return generateCardsFromPlan({ data: input })
    }
  })
