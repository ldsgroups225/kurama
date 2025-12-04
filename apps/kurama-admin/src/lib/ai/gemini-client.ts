import { GoogleGenAI, Type } from '@google/genai'
import {
  getLessonPlanPrompt,
  getCompleteCardPrompt,
  type LessonPlanPromptParams,
} from './prompts'

// Types for AI responses
export interface WebSource {
  uri: string
  title: string
}

export interface LessonPlanResult {
  content: string
  sources: WebSource[]
}

export interface CompleteCardResult {
  title: string
  frontContent: string
  backContent: string
  question: string
  options: { id: string; text: string; isCorrect: boolean }[]
  explanation: string
  hints: string[]
}

/**
 * Create a Gemini AI client
 */
export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey })
}

/**
 * Generate a lesson plan using Gemini AI with Google Search grounding
 */
export async function generateLessonPlan(
  apiKey: string,
  params: LessonPlanPromptParams
): Promise<LessonPlanResult> {
  const ai = createGeminiClient(apiKey)
  const model = 'gemini-2.5-flash'
  const prompt = getLessonPlanPrompt(params)

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    })

    const content = result.text || ''

    // Extract sources from grounding metadata
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata
    const sources: WebSource[] = []

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        const web = (chunk as { web?: { uri: string; title?: string } }).web
        if (web) {
          sources.push({
            uri: web.uri,
            title: web.title || web.uri,
          })
        }
      }
    }

    return { content, sources }
  } catch (error) {
    console.error('Error generating lesson plan:', error)
    throw new Error(
      "Échec de la génération du plan de leçon. L'API a peut-être rejeté la requête. Vérifiez votre clé API et votre connexion réseau."
    )
  }
}

/**
 * Generate complete cards (flashcard + quiz) from lesson content using Gemini AI
 */
export async function generateCompleteCards(
  apiKey: string,
  lessonContent: string,
  amount: number
): Promise<CompleteCardResult[]> {
  const ai = createGeminiClient(apiKey)
  const model = 'gemini-2.5-flash'
  const prompt = getCompleteCardPrompt({ lessonContent, amount })

  const completeCardSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Titre bref du concept' },
      frontContent: { type: Type.STRING, description: 'Contenu du recto (question/terme)' },
      backContent: { type: Type.STRING, description: 'Contenu du verso (réponse/définition)' },
      question: { type: Type.STRING, description: 'Question de quiz reformulée' },
      options: {
        type: Type.ARRAY,
        description: 'Options de réponse (4 options, une seule correcte)',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Identifiant (A, B, C, D)" },
            text: { type: Type.STRING, description: "Texte de l'option" },
            isCorrect: { type: Type.BOOLEAN, description: 'Vrai si correcte' },
          },
          required: ['id', 'text', 'isCorrect'],
        },
      },
      explanation: { type: Type.STRING, description: 'Explication de la bonne réponse' },
      hints: {
        type: Type.ARRAY,
        description: 'Indices pour aider l\'étudiant',
        items: { type: Type.STRING },
      },
    },
    required: ['title', 'frontContent', 'backContent', 'question', 'options', 'explanation', 'hints'],
  }

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: completeCardSchema,
        },
      },
    })

    const jsonStr = result.text || '[]'
    return JSON.parse(jsonStr) as CompleteCardResult[]
  } catch (error) {
    console.error('Error generating complete cards:', error)
    throw new Error(
      "Échec de la génération des cartes. L'API a peut-être rejeté la requête ou retourné des données invalides."
    )
  }
}
