import { googleAI } from '@genkit-ai/google-genai'
import { genkit } from 'genkit'

/**
 * Initialize Genkit with Google AI plugin
 * Uses GEMINI_API_KEY environment variable
 */
export function initializeGenkit() {
  return genkit({
    plugins: [googleAI()],
  })
}

/**
 * Get the configured Gemini model
 * Using gemini-3-flash-preview for best performance/cost ratio
 */
export function getGeminiModel() {
  return googleAI.model('gemini-3-flash-preview')
}
