// AI Prompt templates for lesson plan and card generation

export interface LessonPlanPromptParams {
  country: string
  subject: string
  grade: string
  language: string
  schoolYear: string
  lessonTitle: string
  customInstructions?: string
}

export interface CardGenerationPromptParams {
  lessonContent: string
  amount: number
}

/**
 * Generate the prompt for lesson plan generation
 */
export function getLessonPlanPrompt(params: LessonPlanPromptParams): string {
  const { country, subject, grade, language, schoolYear, lessonTitle, customInstructions } = params

  let prompt = `
Tu es un expert en conception de programmes scolaires spécialisé dans les systèmes éducatifs mondiaux. Ta tâche est de générer un plan de leçon détaillé basé sur le programme éducatif officiel du pays et de l'année scolaire spécifiés.

**Pays:** ${country}
**Niveau scolaire:** ${grade}
**Matière:** ${subject}
**Année scolaire:** ${schoolYear}
**Langue du plan de leçon:** ${language}
**Titre de la leçon:** "${lessonTitle}"

La leçon doit porter spécifiquement sur ce titre. Le titre principal du document markdown généré (commençant par '# ') DOIT être exactement "${lessonTitle}".

En utilisant tes capacités de recherche, trouve les directives curriculaires les plus actuelles et précises pour le pays et le niveau fournis afin d'informer le plan de leçon.

**IMPORTANT:** Priorise les informations des sites suivants si disponibles: scribd.com, ecoleweb.ci, et dpfc-ci.net. Ensuite, complète avec des informations d'autres sources officielles.

La sortie doit être en ${language === 'French' ? 'français' : 'anglais'}.

Structure ta réponse en Markdown avec un titre principal (commençant par '# ') et les en-têtes de section suivants exactement comme écrits:
### Objectifs d'apprentissage
### Matériel requis
### Activités étape par étape
### Méthodes d'évaluation

Sous chaque en-tête, utilise des puces pour les listes.
Pour les formules mathématiques, utilise la syntaxe LaTeX (ex: $E=mc^2$ pour les équations en bloc, et $ax^2 + bx + c = 0$ pour les équations en ligne).
`

  if (customInstructions) {
    prompt += `

**Instructions personnalisées:**
${customInstructions}
`
  }

  return prompt
}

/**
 * Generate the prompt for complete card generation (flashcard + quiz in one)
 */
export function getCompleteCardPrompt(params: CardGenerationPromptParams): string {
  const { lessonContent, amount } = params

  return `
Basé sur le contenu du plan de leçon suivant, crée ${amount} cartes d'étude complètes qui couvrent l'ensemble de la leçon. Chaque carte doit se concentrer sur un seul concept clé.

Chaque carte DOIT inclure:
1. **Contenu Flashcard**: Un recto (question/terme) et un verso (réponse/définition)
2. **Quiz QCM**: Une question avec 4 options (A, B, C, D), une seule correcte
3. **Explication**: Pourquoi la réponse est correcte
4. **Indices**: 1-2 indices pour aider l'étudiant

**Règles de formatage:**
- Utilise Markdown pour le formatage (gras, italique, listes)
- Pour les formules mathématiques, utilise LaTeX: $E=mc^2$ (inline) ou $$ax^2+bx+c=0$$ (bloc)
- Les options de quiz doivent être plausibles mais une seule correcte

**Contenu du plan de leçon:**
---
${lessonContent}
---

Génère un tableau JSON avec cette structure pour chaque carte:
[
  {
    "title": "Titre bref du concept",
    "frontContent": "Question ou terme à mémoriser",
    "backContent": "Réponse ou définition complète",
    "question": "Question de quiz reformulée",
    "options": [
      { "id": "A", "text": "Option A", "isCorrect": false },
      { "id": "B", "text": "Option B (correcte)", "isCorrect": true },
      { "id": "C", "text": "Option C", "isCorrect": false },
      { "id": "D", "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Explication détaillée de la bonne réponse",
    "hints": ["Premier indice", "Deuxième indice"]
  }
]
`
}
