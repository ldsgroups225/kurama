/**
 * Vector search and embedding queries for RAG-enhanced card generation
 * Phase 4: Advanced vector search with hybrid retrieval
 */
import { eq, desc, sql, and, or, ilike } from 'drizzle-orm'
import { lessonsContentChunks, lessonsContentFile } from '@/drizzle/schema'
import type { Database } from '@/database/setup'

export interface ChunkSearchResult {
  id: number
  chunkText: string
  chunkIndex: number
  fileName: string
  pageNumber: number | null
  similarity: number
}

export interface LessonChunk {
  chunkText: string
  fileName: string
  pageNumber: number | null
  chunkIndex: number
}

export interface RankedChunk extends ChunkSearchResult {
  /** Combined score from vector similarity + keyword matching */
  combinedScore: number
  /** Whether this chunk matched keyword search */
  keywordMatch: boolean
}

export interface HybridSearchOptions {
  /** Number of results from vector search */
  vectorTopK?: number
  /** Number of results from keyword search */
  keywordTopK?: number
  /** Weight for vector similarity (0-1) */
  vectorWeight?: number
  /** Minimum similarity threshold */
  minSimilarity?: number
  /** Keywords to boost in results */
  boostKeywords?: string[]
}

/**
 * Search for relevant chunks using vector similarity (cosine distance)
 * Requires pgvector extension with <=> operator
 */
export async function searchRelevantChunks(
  db: Database,
  lessonId: number,
  queryEmbedding: number[],
  topK: number = 5
): Promise<ChunkSearchResult[]> {
  // Cosine similarity: 1 - cosine_distance
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
    .innerJoin(
      lessonsContentFile,
      eq(lessonsContentChunks.fileId, lessonsContentFile.id)
    )
    .where(eq(lessonsContentFile.lessonId, lessonId))
    .orderBy(desc(similarity))
    .limit(topK)

  return results
}

/**
 * Get all chunks for a lesson (for smaller datasets without vector search)
 * Ordered by file and chunk index for coherent reading
 */
export async function getLessonChunks(
  db: Database,
  lessonId: number,
  limit?: number
): Promise<LessonChunk[]> {
  let query = db
    .select({
      chunkText: lessonsContentChunks.chunkText,
      fileName: lessonsContentFile.fileName,
      pageNumber: lessonsContentChunks.pageNumber,
      chunkIndex: lessonsContentChunks.chunkIndex,
    })
    .from(lessonsContentChunks)
    .innerJoin(
      lessonsContentFile,
      eq(lessonsContentChunks.fileId, lessonsContentFile.id)
    )
    .where(eq(lessonsContentFile.lessonId, lessonId))
    .orderBy(lessonsContentFile.id, lessonsContentChunks.chunkIndex)

  if (limit) {
    query = query.limit(limit) as typeof query
  }

  return await query
}

/**
 * Get chunk count for a lesson to decide between simple RAG vs vector search
 */
export async function getLessonChunkCount(
  db: Database,
  lessonId: number
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessonsContentChunks)
    .innerJoin(
      lessonsContentFile,
      eq(lessonsContentChunks.fileId, lessonsContentFile.id)
    )
    .where(eq(lessonsContentFile.lessonId, lessonId))

  return Number(result[0]?.count ?? 0)
}

/**
 * Check if a lesson has any embedded content
 */
export async function hasLessonEmbeddings(
  db: Database,
  lessonId: number
): Promise<boolean> {
  const result = await db
    .select({ hasEmbeddings: lessonsContentFile.hasEmbeddings })
    .from(lessonsContentFile)
    .where(eq(lessonsContentFile.lessonId, lessonId))
    .limit(1)

  return result.some(r => r.hasEmbeddings)
}

/**
 * Deduplicate chunks by similarity threshold
 * Removes chunks that are too similar to already selected ones
 */
export function deduplicateChunks(
  chunks: ChunkSearchResult[],
  similarityThreshold: number = 0.95
): ChunkSearchResult[] {
  const unique: ChunkSearchResult[] = []

  for (const chunk of chunks) {
    // Simple dedup by checking if chunk text is substantially different
    const isDuplicate = unique.some(existing => {
      const overlap = calculateTextOverlap(existing.chunkText, chunk.chunkText)
      return overlap > similarityThreshold
    })

    if (!isDuplicate) {
      unique.push(chunk)
    }
  }

  return unique
}

/**
 * Calculate text overlap ratio (Jaccard similarity)
 */
function calculateTextOverlap(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

// ============================================================================
// Phase 4: Advanced Vector Search Enhancement
// ============================================================================

/**
 * Keyword-based search for chunks (BM25-like text matching)
 * Useful for exact term matching that vector search might miss
 */
export async function searchChunksByKeywords(
  db: Database,
  lessonId: number,
  keywords: string[],
  limit: number = 5
): Promise<ChunkSearchResult[]> {
  if (keywords.length === 0) return []

  // Build OR conditions for each keyword
  const keywordConditions = keywords.map(kw =>
    ilike(lessonsContentChunks.chunkText, `%${kw}%`)
  )

  const results = await db
    .select({
      id: lessonsContentChunks.id,
      chunkText: lessonsContentChunks.chunkText,
      chunkIndex: lessonsContentChunks.chunkIndex,
      pageNumber: lessonsContentChunks.pageNumber,
      fileName: lessonsContentFile.fileName,
      // Count keyword matches as pseudo-similarity
      similarity: sql<number>`1.0`,
    })
    .from(lessonsContentChunks)
    .innerJoin(
      lessonsContentFile,
      eq(lessonsContentChunks.fileId, lessonsContentFile.id)
    )
    .where(
      and(
        eq(lessonsContentFile.lessonId, lessonId),
        or(...keywordConditions)
      )
    )
    .limit(limit)

  // Score by number of keyword matches
  return results.map(r => ({
    ...r,
    similarity: calculateKeywordScore(r.chunkText, keywords),
  }))
}

/**
 * Calculate keyword match score (0-1)
 */
function calculateKeywordScore(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()
  const matches = keywords.filter(kw => lowerText.includes(kw.toLowerCase()))
  return matches.length / keywords.length
}

/**
 * Hybrid search combining vector similarity and keyword matching
 * Best for large document sets where pure vector search may miss exact terms
 */
export async function hybridSearch(
  db: Database,
  lessonId: number,
  queryEmbedding: number[],
  keywords: string[],
  options: HybridSearchOptions = {}
): Promise<RankedChunk[]> {
  const {
    vectorTopK = 10,
    keywordTopK = 5,
    vectorWeight = 0.7,
    minSimilarity = 0.3,
    boostKeywords = [],
  } = options

  // Parallel search: vector + keyword
  const [vectorResults, keywordResults] = await Promise.all([
    searchRelevantChunks(db, lessonId, queryEmbedding, vectorTopK),
    searchChunksByKeywords(db, lessonId, keywords, keywordTopK),
  ])

  // Merge results with combined scoring
  const chunkMap = new Map<number, RankedChunk>()

  // Add vector results
  for (const chunk of vectorResults) {
    if (chunk.similarity < minSimilarity) continue

    chunkMap.set(chunk.id, {
      ...chunk,
      combinedScore: chunk.similarity * vectorWeight,
      keywordMatch: false,
    })
  }

  // Merge keyword results
  const keywordWeight = 1 - vectorWeight
  for (const chunk of keywordResults) {
    const existing = chunkMap.get(chunk.id)
    if (existing) {
      // Boost score if found in both searches
      existing.combinedScore += chunk.similarity * keywordWeight
      existing.keywordMatch = true
    } else {
      chunkMap.set(chunk.id, {
        ...chunk,
        combinedScore: chunk.similarity * keywordWeight,
        keywordMatch: true,
      })
    }
  }

  // Apply boost keywords
  if (boostKeywords.length > 0) {
    for (const [, chunk] of chunkMap) {
      const boostScore = calculateKeywordScore(chunk.chunkText, boostKeywords)
      if (boostScore > 0) {
        chunk.combinedScore *= (1 + boostScore * 0.2) // 20% boost max
      }
    }
  }

  // Sort by combined score and return
  return Array.from(chunkMap.values())
    .sort((a, b) => b.combinedScore - a.combinedScore)
}

/**
 * Multi-query vector search with result fusion
 * Searches with multiple query variations and merges results
 */
export async function multiQuerySearch(
  db: Database,
  lessonId: number,
  queryEmbeddings: { query: string; embedding: number[] }[],
  topK: number = 5
): Promise<RankedChunk[]> {
  if (queryEmbeddings.length === 0) return []

  // Search for each query
  const allResults = await Promise.all(
    queryEmbeddings.map(({ embedding }) =>
      searchRelevantChunks(db, lessonId, embedding, topK)
    )
  )

  // Reciprocal Rank Fusion (RRF) scoring
  const chunkScores = new Map<number, { chunk: ChunkSearchResult; score: number; queryCount: number }>()
  const k = 60 // RRF constant

  for (const results of allResults) {
    for (let rank = 0; rank < results.length; rank++) {
      const chunk = results[rank]
      if (!chunk) continue

      const rrfScore = 1 / (k + rank + 1)

      const existing = chunkScores.get(chunk.id)
      if (existing) {
        existing.score += rrfScore
        existing.queryCount++
        // Keep the highest similarity
        if (chunk.similarity > existing.chunk.similarity) {
          existing.chunk = chunk
        }
      } else {
        chunkScores.set(chunk.id, {
          chunk,
          score: rrfScore,
          queryCount: 1,
        })
      }
    }
  }

  // Convert to ranked chunks
  return Array.from(chunkScores.values())
    .map(({ chunk, score, queryCount }) => ({
      ...chunk,
      combinedScore: score,
      keywordMatch: queryCount > 1, // Found by multiple queries
    }))
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, topK)
}

/**
 * Get contextual chunks around a target chunk
 * Useful for providing surrounding context
 */
export async function getChunkWithContext(
  db: Database,
  chunkId: number,
  contextWindow: number = 1
): Promise<LessonChunk[]> {
  // First get the target chunk's file and index
  const [targetChunk] = await db
    .select({
      fileId: lessonsContentChunks.fileId,
      chunkIndex: lessonsContentChunks.chunkIndex,
    })
    .from(lessonsContentChunks)
    .where(eq(lessonsContentChunks.id, chunkId))
    .limit(1)

  if (!targetChunk) return []

  // Get surrounding chunks
  const minIndex = Math.max(0, targetChunk.chunkIndex - contextWindow)
  const maxIndex = targetChunk.chunkIndex + contextWindow

  return await db
    .select({
      chunkText: lessonsContentChunks.chunkText,
      fileName: lessonsContentFile.fileName,
      pageNumber: lessonsContentChunks.pageNumber,
      chunkIndex: lessonsContentChunks.chunkIndex,
    })
    .from(lessonsContentChunks)
    .innerJoin(
      lessonsContentFile,
      eq(lessonsContentChunks.fileId, lessonsContentFile.id)
    )
    .where(
      and(
        eq(lessonsContentChunks.fileId, targetChunk.fileId),
        sql`${lessonsContentChunks.chunkIndex} >= ${minIndex}`,
        sql`${lessonsContentChunks.chunkIndex} <= ${maxIndex}`
      )
    )
    .orderBy(lessonsContentChunks.chunkIndex)
}

/**
 * Cluster chunks by topic similarity for diverse retrieval
 * Returns representative chunks from different parts of the document
 */
export function selectDiverseChunks(
  chunks: ChunkSearchResult[],
  targetCount: number,
  diversityThreshold: number = 0.7
): ChunkSearchResult[] {
  if (chunks.length <= targetCount) return chunks

  const selected: ChunkSearchResult[] = []
  const remaining = [...chunks]

  // Always include the top result
  const first = remaining.shift()
  if (first) selected.push(first)

  // Greedily select diverse chunks
  while (selected.length < targetCount && remaining.length > 0) {
    let bestIdx = 0
    let bestDiversity = 0

    for (let i = 0; i < remaining.length; i++) {
      const current = remaining[i]
      if (!current) continue

      // Calculate minimum similarity to already selected chunks
      const minSimilarity = Math.min(
        ...selected.map(s => calculateTextOverlap(s.chunkText, current.chunkText))
      )

      // We want low similarity (high diversity)
      const diversity = 1 - minSimilarity

      // Balance diversity with relevance (original similarity score)
      const score = diversity * 0.4 + current.similarity * 0.6

      if (score > bestDiversity) {
        bestDiversity = score
        bestIdx = i
      }
    }

    // Only add if diverse enough
    const candidate = remaining[bestIdx]
    if (candidate) {
      const maxOverlap = Math.max(
        ...selected.map(s => calculateTextOverlap(s.chunkText, candidate.chunkText))
      )

      if (maxOverlap < diversityThreshold) {
        selected.push(candidate)
      }
    }
    remaining.splice(bestIdx, 1)
  }

  return selected
}
