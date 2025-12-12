/**
 * AI Module - Centralized exports for AI functionality
 */

// Constants
export * from './constants'

// Gemini Client
export {
  // Client
  createGeminiClient,

  // Lesson Plan Generation
  generateLessonPlan,

  // Card Generation
  generateCompleteCards,
  generateCardsWithRAG,
  generateCardsWithFunctionCalling,

  // Embeddings
  generateEmbedding,
  generateEmbeddings,

  // Query Utilities
  extractKeyConcepts,
  generateSearchQueries,
  expandSearchQuery,
  analyzeChunkRelevance,

  // Function Calling
  functionDeclarations,
  executeFunctionCall,

  // Types
  type WebSource,
  type LessonPlanResult,
  type CompleteCardResult,
  type RAGContext,
  type QueryExpansion,
  type FunctionCallContext,
  type FunctionCallResult,
} from './gemini-client'

// Prompts
export {
  getLessonPlanPrompt,
  getCompleteCardPrompt,
  getRAGCardPrompt,
  type LessonPlanPromptParams,
  type CardGenerationPromptParams,
} from './prompts'
