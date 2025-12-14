import type { LessonPlanPromptParams } from './prompts'
import { GoogleGenAI, Type } from '@google/genai'
import {
  AI_CONFIG,
  FUNCTION_CALLING_CONFIG,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_MODEL,
  SIMILARITY_THRESHOLDS,
} from './constants'
import {
  getCompleteCardPrompt,
  getLessonPlanPrompt,
  getRAGCardPrompt,

} from './prompts'

// Re-export constants for convenience
export {
  AI_CONFIG,
  CARD_GENERATION_DEFAULTS,
  FUNCTION_CALLING_CONFIG,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_MODEL,
  LESSON_PLAN_DEFAULTS,
  RAG_THRESHOLDS,
  SIMILARITY_THRESHOLDS,
} from './constants'

// Types for AI responses
export interface WebSource {
  uri: string
  title: string
}

export interface LessonPlanResult {
  content: string
  sources: WebSource[]
  /** Model used for generation */
  model: string
  /** Generation timestamp */
  generatedAt: string
}

export interface CompleteCardResult {
  title: string
  frontContent: string
  backContent: string
  question: string
  options: { id: string, text: string, isCorrect: boolean }[]
  explanation: string
  hints: string[]
  difficulty?: number
  sourceReference?: string
  bloomsLevel?: string
}

// RAG context for card generation
export interface RAGContext {
  lessonPlan: string
  attachmentChunks: { text: string, source: string, pageNumber?: number | null }[]
  metadata: {
    subject: string
    grade?: string
    series?: string
    difficulty?: string
    lessonTitle?: string
  }
}

/**
 * Create a Gemini AI client
 */
export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey })
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = AI_CONFIG.retry.maxAttempts,
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error as Error
      console.warn(`[AI] Attempt ${attempt}/${maxAttempts} failed:`, error)

      if (attempt < maxAttempts) {
        const delay = AI_CONFIG.retry.delayMs * 2 ** (attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Generate a lesson plan using Gemini AI with Google Search grounding
 * Enhanced with retry logic and better error handling
 */
export async function generateLessonPlan(
  apiKey: string,
  params: LessonPlanPromptParams,
): Promise<LessonPlanResult> {
  const ai = createGeminiClient(apiKey)
  const prompt = getLessonPlanPrompt(params)

  return withRetry(async () => {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    })

    const content = result.text || ''

    if (!content || content.length < 100) {
      throw new Error('Generated content is too short or empty')
    }

    // Extract sources from grounding metadata
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata
    const sources: WebSource[] = []

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        const web = (chunk as { web?: { uri: string, title?: string } }).web
        if (web) {
          sources.push({
            uri: web.uri,
            title: web.title || web.uri,
          })
        }
      }
    }

    // Deduplicate sources by URI
    const uniqueSources = sources.filter(
      (source, index, self) => index === self.findIndex(s => s.uri === source.uri),
    )

    return {
      content,
      sources: uniqueSources,
      model: GEMINI_MODEL,
      generatedAt: new Date().toISOString(),
    }
  }).catch((error) => {
    console.error('Error generating lesson plan:', error)
    throw new Error(
      'Échec de la génération du plan de leçon. L\'API a peut-être rejeté la requête. Vérifiez votre clé API et votre connexion réseau.',
    )
  })
}

// Card schema with additional metadata (per Gemini best practices)
const cardSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Titre concis du concept (max 60 caractères)',
    },
    frontContent: {
      type: Type.STRING,
      description: 'Question ou terme à mémoriser, format Markdown supporté',
    },
    backContent: {
      type: Type.STRING,
      description: 'Réponse ou définition détaillée, format Markdown supporté',
    },
    question: {
      type: Type.STRING,
      description: 'Question reformulée pour le mode quiz',
    },
    options: {
      type: Type.ARRAY,
      description: '4 options de réponse, une seule correcte',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifiant: A, B, C ou D' },
          text: { type: Type.STRING, description: 'Texte de l\'option (max 150 caractères)' },
          isCorrect: { type: Type.BOOLEAN, description: 'true si c\'est la bonne réponse' },
        },
        required: ['id', 'text', 'isCorrect'],
      },
    },
    explanation: {
      type: Type.STRING,
      description: 'Explication détaillée de pourquoi la réponse est correcte',
    },
    hints: {
      type: Type.ARRAY,
      description: '2-3 indices progressifs pour aider l\'étudiant',
      items: { type: Type.STRING },
    },
    difficulty: {
      type: Type.INTEGER,
      description: 'Niveau de difficulté: 0=facile, 1=moyen, 2=difficile',
    },
    sourceReference: {
      type: Type.STRING,
      description: 'Référence au document source (nom du fichier ou section)',
    },
    bloomsLevel: {
      type: Type.STRING,
      description: 'Niveau taxonomie de Bloom: remember, understand, apply, analyze',
    },
  },
  required: [
    'title',
    'frontContent',
    'backContent',
    'question',
    'options',
    'explanation',
    'hints',
    'difficulty',
  ],
}

/**
 * Generate complete cards (flashcard + quiz) from lesson content using Gemini AI
 * Enhanced with retry logic and validation
 */
export async function generateCompleteCards(
  apiKey: string,
  lessonContent: string,
  amount: number,
): Promise<CompleteCardResult[]> {
  const ai = createGeminiClient(apiKey)
  const prompt = getCompleteCardPrompt({ lessonContent, amount })

  return withRetry(async () => {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: cardSchema,
        },
      },
    })

    const jsonStr = result.text || '[]'
    const cards = JSON.parse(jsonStr) as CompleteCardResult[]

    // Validate cards have required fields
    const validCards = cards.filter(card =>
      card.title
      && card.frontContent
      && card.backContent
      && card.question
      && Array.isArray(card.options)
      && card.options.length === 4,
    )

    if (validCards.length === 0) {
      throw new Error('No valid cards generated')
    }

    return validCards
  }).catch((error) => {
    console.error('Error generating complete cards:', error)
    throw new Error(
      'Échec de la génération des cartes. L\'API a peut-être rejeté la requête ou retourné des données invalides.',
    )
  })
}

/**
 * Generate cards with RAG context from lesson attachments
 * Reduces hallucinations by grounding generation in actual document content
 * Enhanced with retry logic and validation
 */
export async function generateCardsWithRAG(
  apiKey: string,
  context: RAGContext,
  amount: number,
): Promise<CompleteCardResult[]> {
  const ai = createGeminiClient(apiKey)
  const prompt = getRAGCardPrompt(context, amount)

  return withRetry(async () => {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: cardSchema,
        },
      },
    })

    const jsonStr = result.text || '[]'
    const cards = JSON.parse(jsonStr) as CompleteCardResult[]

    // Validate cards have required fields
    const validCards = cards.filter(card =>
      card.title
      && card.frontContent
      && card.backContent
      && card.question
      && Array.isArray(card.options)
      && card.options.length === 4,
    )

    if (validCards.length === 0) {
      throw new Error('No valid cards generated')
    }

    return validCards
  }).catch((error) => {
    console.error('Error generating cards with RAG:', error)
    throw new Error(
      'Échec de la génération des cartes avec contexte enrichi. Vérifiez votre clé API et réessayez.',
    )
  })
}

/**
 * Generate embedding for a text query using Gemini
 * Enhanced with retry logic
 */
export async function generateEmbedding(
  apiKey: string,
  text: string,
): Promise<number[]> {
  const ai = createGeminiClient(apiKey)

  return withRetry(async () => {
    const result = await ai.models.embedContent({
      model: GEMINI_EMBEDDING_MODEL,
      contents: text,
    })

    const embedding = result.embeddings?.[0]?.values || []

    if (embedding.length === 0) {
      throw new Error('Empty embedding returned')
    }

    return embedding
  }).catch((error) => {
    console.error('Error generating embedding:', error)
    throw new Error('Échec de la génération de l\'embedding.')
  })
}

/**
 * Extract key concepts from lesson plan for targeted vector search
 */
export async function extractKeyConcepts(
  apiKey: string,
  lessonPlan: string,
  maxConcepts: number = 5,
): Promise<string[]> {
  const ai = createGeminiClient(apiKey)

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Extrais les ${maxConcepts} concepts clés les plus importants de ce plan de leçon. 
Retourne uniquement un JSON array de strings courts (2-5 mots chacun).

Plan de leçon:
${lessonPlan}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    })

    const concepts = JSON.parse(result.text || '[]') as string[]
    return concepts.slice(0, maxConcepts)
  }
  catch (error) {
    console.error('Error extracting key concepts:', error)
    return [] // Return empty array on failure, don't block generation
  }
}

// ============================================================================
// Phase 4: Advanced Query Expansion and Multi-Query Generation
// ============================================================================

export interface QueryExpansion {
  original: string
  variations: string[]
  keywords: string[]
}

/**
 * Expand a search query into multiple variations for better retrieval
 * Uses LLM to generate semantically similar queries
 */
export async function expandSearchQuery(
  apiKey: string,
  query: string,
  context?: string,
): Promise<QueryExpansion> {
  const ai = createGeminiClient(apiKey)

  try {
    const contextInfo = context ? `\nContexte: ${context}` : ''

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Tu es un expert en recherche d'information. Génère des variations de cette requête pour améliorer la recherche.
${contextInfo}

Requête originale: "${query}"

Génère:
1. 3 reformulations sémantiquement équivalentes
2. 5 mots-clés importants extraits de la requête

Format JSON:
{
  "variations": ["reformulation 1", "reformulation 2", "reformulation 3"],
  "keywords": ["mot1", "mot2", "mot3", "mot4", "mot5"]
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['variations', 'keywords'],
        },
      },
    })

    const parsed = JSON.parse(result.text || '{}') as { variations: string[], keywords: string[] }
    return {
      original: query,
      variations: parsed.variations || [],
      keywords: parsed.keywords || [],
    }
  }
  catch (error) {
    console.error('Error expanding query:', error)
    return { original: query, variations: [], keywords: [] }
  }
}

/**
 * Generate multiple search queries from lesson plan sections
 * For comprehensive document coverage
 */
export async function generateSearchQueries(
  apiKey: string,
  lessonPlan: string,
  targetCount: number = 5,
): Promise<string[]> {
  const ai = createGeminiClient(apiKey)

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyse ce plan de leçon et génère ${targetCount} requêtes de recherche distinctes.
Chaque requête doit cibler un aspect différent du contenu pour une couverture complète.

Plan de leçon:
${lessonPlan}

Génère des requêtes qui permettraient de trouver:
- Définitions et concepts clés
- Exemples et applications
- Dates, noms et faits importants
- Relations et comparaisons
- Formules ou procédures

Retourne un JSON array de ${targetCount} requêtes de recherche (phrases courtes de 5-10 mots).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    })

    const queries = JSON.parse(result.text || '[]') as string[]
    return queries.slice(0, targetCount)
  }
  catch (error) {
    console.error('Error generating search queries:', error)
    return []
  }
}

/**
 * Batch generate embeddings for multiple texts
 * More efficient than individual calls
 */
export async function generateEmbeddings(
  apiKey: string,
  texts: string[],
): Promise<{ text: string, embedding: number[] }[]> {
  const ai = createGeminiClient(apiKey)

  const results: { text: string, embedding: number[] }[] = []

  // Process in batches to avoid rate limits
  const batchSize = AI_CONFIG.batch.embeddingSize
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (text) => {
        try {
          const result = await ai.models.embedContent({
            model: GEMINI_EMBEDDING_MODEL,
            contents: text,
          })
          return {
            text,
            embedding: result.embeddings?.[0]?.values || [],
          }
        }
        catch (error) {
          console.error(`Error embedding text: ${text.slice(0, 50)}...`, error)
          return { text, embedding: [] }
        }
      }),
    )

    results.push(...batchResults)
  }

  return results.filter(r => r.embedding.length > 0)
}

/**
 * Analyze chunk relevance and generate a relevance explanation
 * Helps with debugging and transparency
 */
export async function analyzeChunkRelevance(
  apiKey: string,
  query: string,
  chunks: { text: string, source: string }[],
): Promise<{ chunkIndex: number, relevance: 'high' | 'medium' | 'low', reason: string }[]> {
  if (chunks.length === 0)
    return []

  const ai = createGeminiClient(apiKey)

  try {
    const chunksText = chunks
      .map((c, i) => `[Chunk ${i}] Source: ${c.source}\n${c.text.slice(0, 500)}...`)
      .join('\n\n')

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Évalue la pertinence de chaque chunk pour cette requête.

Requête: "${query}"

Chunks:
${chunksText}

Pour chaque chunk, indique:
- relevance: "high", "medium", ou "low"
- reason: explication courte (max 50 mots)

Retourne un JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chunkIndex: { type: Type.INTEGER },
              relevance: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ['chunkIndex', 'relevance', 'reason'],
          },
        },
      },
    })

    return JSON.parse(result.text || '[]')
  }
  catch (error) {
    console.error('Error analyzing chunk relevance:', error)
    return []
  }
}

// ============================================================================
// Phase 5: Function Calling for Dynamic Context Retrieval
// ============================================================================

/**
 * Function declarations for Gemini function calling
 * These allow the model to dynamically request information during generation
 */
export const functionDeclarations = {
  searchDocuments: {
    name: 'search_lesson_documents',
    description:
      'Recherche des informations spécifiques dans les documents attachés à la leçon. Utilise cette fonction quand tu as besoin de détails précis sur un concept, une définition, une date, ou un fait.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            'La requête de recherche pour trouver des informations pertinentes (ex: "définition photosynthèse", "date indépendance")',
        },
        maxResults: {
          type: Type.INTEGER,
          description: 'Nombre maximum de résultats à retourner (1-5, défaut: 3)',
        },
      },
      required: ['query'],
    },
  },

  getLessonMetadata: {
    name: 'get_lesson_metadata',
    description:
      'Récupère les métadonnées complètes de la leçon (matière, niveau, série, titre, objectifs).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },

  validateFact: {
    name: 'validate_fact',
    description:
      'Vérifie si une information ou un fait est présent dans les documents sources avant de l\'utiliser dans une carte. Retourne la confiance et le texte de support.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        statement: {
          type: Type.STRING,
          description: 'L\'affirmation ou le fait à vérifier dans les documents',
        },
      },
      required: ['statement'],
    },
  },

  getDocumentSection: {
    name: 'get_document_section',
    description:
      'Récupère une section spécifique d\'un document par son nom de fichier et numéro de page approximatif.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fileName: {
          type: Type.STRING,
          description: 'Nom du fichier source',
        },
        pageNumber: {
          type: Type.INTEGER,
          description: 'Numéro de page approximatif (optionnel)',
        },
      },
      required: ['fileName'],
    },
  },
}

/**
 * Context passed to function call handlers
 */
export interface FunctionCallContext {
  lessonId: number
  apiKey: string
  metadata: {
    subject: string
    grade?: string
    series?: string
    difficulty?: string
    lessonTitle?: string
  }
  // Database query functions injected from server
  searchChunks: (query: string, topK: number) => Promise<
    {
      text: string
      source: string
      pageNumber: number | null
      similarity: number
    }[]
  >
  getChunksByFile: (
    fileName: string,
    pageNumber?: number,
  ) => Promise<{ text: string, pageNumber: number | null }[]>
}

/**
 * Result from a function call
 */
export interface FunctionCallResult {
  name: string
  result: unknown
}

/**
 * Execute a function call from the model
 */
export async function executeFunctionCall(
  functionName: string,
  args: Record<string, unknown>,
  ctx: FunctionCallContext,
): Promise<FunctionCallResult> {
  switch (functionName) {
    case 'search_lesson_documents': {
      const query = args.query as string
      const maxResults = Math.min((args.maxResults as number) || 3, FUNCTION_CALLING_CONFIG.maxSearchResults)

      const results = await ctx.searchChunks(query, maxResults)

      return {
        name: functionName,
        result: {
          found: results.length > 0,
          count: results.length,
          results: results.map(r => ({
            text: r.text,
            source: r.source,
            page: r.pageNumber,
            relevance: r.similarity > SIMILARITY_THRESHOLDS.highRelevance ? 'high' : r.similarity > SIMILARITY_THRESHOLDS.mediumRelevance ? 'medium' : 'low',
          })),
        },
      }
    }

    case 'get_lesson_metadata': {
      return {
        name: functionName,
        result: {
          lessonId: ctx.lessonId,
          title: ctx.metadata.lessonTitle || 'Non spécifié',
          subject: ctx.metadata.subject,
          grade: ctx.metadata.grade || 'Non spécifié',
          series: ctx.metadata.series || 'Non applicable',
          difficulty: ctx.metadata.difficulty || 'Non spécifié',
        },
      }
    }

    case 'validate_fact': {
      const statement = args.statement as string

      // Search for the statement in documents
      const results = await ctx.searchChunks(statement, 3)

      const bestMatch = results[0]
      const isValidated = bestMatch && bestMatch.similarity > FUNCTION_CALLING_CONFIG.factValidationThreshold

      return {
        name: functionName,
        result: {
          validated: isValidated,
          confidence: bestMatch?.similarity || 0,
          supportingText: isValidated ? bestMatch.text.slice(0, 500) : null,
          source: isValidated ? bestMatch.source : null,
        },
      }
    }

    case 'get_document_section': {
      const fileName = args.fileName as string
      const pageNumber = args.pageNumber as number | undefined

      const chunks = await ctx.getChunksByFile(fileName, pageNumber)

      return {
        name: functionName,
        result: {
          found: chunks.length > 0,
          fileName,
          sections: chunks.map(c => ({
            text: c.text,
            page: c.pageNumber,
          })),
        },
      }
    }

    default:
      return {
        name: functionName,
        result: { error: `Unknown function: ${functionName}` },
      }
  }
}

/**
 * Generate cards using function calling for dynamic context retrieval
 * The model can request specific information during generation
 */
export async function generateCardsWithFunctionCalling(
  apiKey: string,
  lessonPlan: string,
  amount: number,
  ctx: FunctionCallContext,
): Promise<{ cards: CompleteCardResult[], functionCalls: string[] }> {
  const ai = createGeminiClient(apiKey)

  // Build tools array with function declarations
  const tools = [
    {
      functionDeclarations: [
        functionDeclarations.searchDocuments,
        functionDeclarations.getLessonMetadata,
        functionDeclarations.validateFact,
        functionDeclarations.getDocumentSection,
      ],
    },
  ]

  const initialPrompt = `Tu es un expert en création de contenu éducatif pour le système scolaire ivoirien.

## Plan de leçon
${lessonPlan}

## Ta mission
Génère ${amount} cartes d'étude complètes, précises et factuelles.

## Outils disponibles
Tu as accès à des fonctions pour:
1. **search_lesson_documents**: Rechercher des informations dans les documents attachés
2. **get_lesson_metadata**: Obtenir les métadonnées de la leçon
3. **validate_fact**: Vérifier si un fait est présent dans les sources
4. **get_document_section**: Récupérer une section spécifique d'un document

## Instructions
1. D'abord, utilise get_lesson_metadata() pour comprendre le contexte
2. Pour chaque concept important, utilise search_lesson_documents() pour trouver des détails
3. Avant d'inclure un fait spécifique (date, nom, chiffre), utilise validate_fact() pour vérifier
4. Ne crée PAS de cartes avec des informations non vérifiées

## Format de sortie final
Quand tu as terminé tes recherches, génère un JSON array avec ${amount} cartes.
Chaque carte: title, frontContent, backContent, question, options (4), explanation, hints, difficulty (0-2), sourceReference, bloomsLevel.

Commence par explorer le contexte avec les fonctions disponibles.`

  // Track conversation as simple string for context
  let conversationContext = initialPrompt
  const functionCallsLog: string[] = []
  const maxIterations = FUNCTION_CALLING_CONFIG.maxIterations
  let iteration = 0

  while (iteration < maxIterations) {
    iteration++

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: conversationContext,
        config: { tools },
      })

      // Check for function calls
      const functionCalls = response.functionCalls
      if (functionCalls && functionCalls.length > 0) {
        // Process each function call
        for (const fc of functionCalls) {
          const name = fc.name || 'unknown'
          const args = fc.args || {}
          console.warn(`[FunctionCall] ${name}(${JSON.stringify(args)})`)
          functionCallsLog.push(`${name}(${JSON.stringify(args)})`)

          // Execute the function
          const result = await executeFunctionCall(name, args as Record<string, unknown>, ctx)
          console.warn(`[FunctionResult] ${name}:`, JSON.stringify(result.result).slice(0, 200))

          // Add to conversation context
          conversationContext += `\n\n[Résultat de ${name}]: ${JSON.stringify(result.result)}`
        }

        // Ask model to continue
        conversationContext += `\n\nContinue avec les informations obtenues. Si tu as assez d'informations, génère les ${amount} cartes en JSON.`
      }
      else {
        // No more function calls - try to parse the final response
        const text = response.text || ''

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const cards = JSON.parse(jsonMatch[0]) as CompleteCardResult[]
            console.warn(`[FunctionCalling] Generated ${cards.length} cards after ${iteration} iterations`)
            return { cards, functionCalls: functionCallsLog }
          }
          catch {
            // JSON parsing failed, ask model to format correctly
            conversationContext += `\n\n${text}\n\nLe JSON n'est pas valide. Génère uniquement un JSON array valide avec ${amount} cartes, sans texte supplémentaire.`
          }
        }
        else {
          // No JSON found, prompt for final output
          conversationContext += `\n\n${text}\n\nMaintenant génère le JSON array final avec ${amount} cartes basées sur les informations collectées.`
        }
      }
    }
    catch (error) {
      console.error(`[FunctionCalling] Error at iteration ${iteration}:`, error)
      throw error
    }
  }

  throw new Error(`Échec de la génération après ${maxIterations} itérations`)
}
