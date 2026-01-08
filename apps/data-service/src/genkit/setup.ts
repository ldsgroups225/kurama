import { GoogleGenAI } from '@google/genai'

// Singleton instance (lazy initialized)
let aiClient: GoogleGenAI | null = null

/**
 * Initialize Google GenAI client
 * Uses GEMINI_API_KEY environment variable
 */
export function initializeGenAI(apiKey: string): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey })
  }
  return aiClient
}

/**
 * Get the configured Gemini model name
 * Using gemini-3-flash-preview for best performance/cost ratio on Workers
 */
export function getGeminiModelName(): string {
  return 'gemini-3-flash-preview'
}

/**
 * Reset the AI client (useful for testing)
 */
export function resetAIClient(): void {
  aiClient = null
}
