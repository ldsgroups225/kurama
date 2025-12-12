/**
 * AI Configuration Constants
 * Centralized configuration for Gemini AI models and settings
 */

// Model identifiers
export const GEMINI_MODEL = 'gemini-2.5-flash' as const
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004' as const

// Generation settings
export const AI_CONFIG = {
  /** Default temperature for creative tasks */
  temperature: {
    creative: 0.8,
    balanced: 0.5,
    precise: 0.2,
  },
  /** Max tokens for different tasks */
  maxTokens: {
    lessonPlan: 8192,
    cards: 4096,
    embedding: 2048,
  },
  /** Retry settings */
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
  /** Batch processing */
  batch: {
    embeddingSize: 5,
    maxConcurrent: 3,
  },
} as const

// RAG thresholds
export const RAG_THRESHOLDS = {
  /** Below this: load all chunks directly */
  directLoad: 10,
  /** Below this: use standard vector search */
  vectorSearch: 30,
  /** Below this: use advanced multi-query search */
  advancedSearch: 50,
  /** Above this: use function calling */
  functionCalling: 50,
} as const

// Similarity thresholds
export const SIMILARITY_THRESHOLDS = {
  /** Minimum similarity for vector search results */
  minSimilarity: 0.25,
  /** High relevance threshold */
  highRelevance: 0.7,
  /** Medium relevance threshold */
  mediumRelevance: 0.5,
  /** Deduplication threshold */
  deduplication: 0.8,
  /** Diversity threshold for chunk selection */
  diversity: 0.65,
} as const

// Function calling settings
export const FUNCTION_CALLING_CONFIG = {
  /** Max iterations for function calling loop */
  maxIterations: 15,
  /** Max results per search */
  maxSearchResults: 5,
  /** Fact validation threshold */
  factValidationThreshold: 0.6,
} as const

// Card generation defaults
export const CARD_GENERATION_DEFAULTS = {
  /** Default number of cards to generate */
  amount: 15,
  /** Min cards */
  minAmount: 5,
  /** Max cards */
  maxAmount: 30,
  /** Points by difficulty */
  points: {
    easy: 10,
    medium: 12,
    hard: 15,
  },
} as const

// Lesson plan defaults
export const LESSON_PLAN_DEFAULTS = {
  country: 'Côte d\'Ivoire',
  language: 'French',
  schoolYear: '2025-2026',
} as const
