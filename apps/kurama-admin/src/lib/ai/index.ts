/**
 * AI Module - Centralized exports for AI functionality
 */

// Constants
export * from './constants'

// Gemini Client
export {
  analyzeChunkRelevance,

  type CompleteCardResult,

  // Client
  createGeminiClient,
  executeFunctionCall,
  expandSearchQuery,

  // Query Utilities
  extractKeyConcepts,
  type FunctionCallContext,

  type FunctionCallResult,
  // Function Calling
  functionDeclarations,
  generateCardsWithFunctionCalling,
  generateCardsWithRAG,

  // Card Generation
  generateCompleteCards,
  // Embeddings
  generateEmbedding,

  generateEmbeddings,
  // Lesson Plan Generation
  generateLessonPlan,
  generateSearchQueries,
  type LessonPlanResult,
  type QueryExpansion,
  type RAGContext,
  // Types
  type WebSource,
} from './gemini-client'

// Prompts
export {
  type CardGenerationPromptParams,
  getCompleteCardPrompt,
  getLessonPlanPrompt,
  getRAGCardPrompt,
  type LessonPlanPromptParams,
} from './prompts'
