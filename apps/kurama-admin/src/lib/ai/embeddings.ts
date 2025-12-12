import { GoogleGenAI } from '@google/genai'

const EMBEDDING_MODEL = 'text-embedding-004'
const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate embedding using Gemini with retry logic for transient errors
 */
export async function generateEmbedding(apiKey: string, text: string): Promise<number[]> {
  const ai = new GoogleGenAI({ apiKey })

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
      })

      return result.embeddings?.[0]?.values || []
    } catch (error) {
      const isRetryable =
        error instanceof Error &&
        (error.message.includes('503') ||
          error.message.includes('overloaded') ||
          error.message.includes('UNAVAILABLE'))

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`Embedding attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`)
        await sleep(RETRY_DELAY_MS * attempt) // Exponential backoff
        continue
      }

      throw error
    }
  }

  return []
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function generateEmbeddings(
  apiKey: string,
  texts: string[]
): Promise<number[][]> {
  const ai = new GoogleGenAI({ apiKey })
  const embeddings: number[][] = []

  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5)
    const batchResults = await Promise.all(
      batch.map(async (text) => {
        const result = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
        })
        return result.embeddings?.[0]?.values || []
      })
    )
    embeddings.push(...batchResults)
  }

  return embeddings
}

/**
 * Split text into chunks with overlap
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) {
      chunks.push(chunk)
    }
  }

  return chunks
}

/**
 * Extract text from PDF buffer using Gemini's native PDF understanding
 * This avoids SSR issues with pdf-parse and provides better extraction
 * Includes retry logic for transient 503 errors
 */
export async function extractTextFromPdf(
  apiKey: string,
  pdfBuffer: ArrayBuffer
): Promise<{ text: string }> {
  const ai = new GoogleGenAI({ apiKey })
  const base64Data = Buffer.from(pdfBuffer).toString('base64')

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: 'Extract all text content from this PDF document. Return only the extracted text, preserving the structure and formatting as much as possible. Do not add any commentary or explanation.',
          },
        ],
      })

      return {
        text: response.text || '',
      }
    } catch (error) {
      const isRetryable =
        error instanceof Error &&
        (error.message.includes('503') ||
          error.message.includes('overloaded') ||
          error.message.includes('UNAVAILABLE'))

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`PDF extraction attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`)
        await sleep(RETRY_DELAY_MS * attempt)
        continue
      }

      throw error
    }
  }

  return { text: '' }
}
