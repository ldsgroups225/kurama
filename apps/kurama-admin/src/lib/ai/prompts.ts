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

export interface RAGContext {
  lessonPlan: string
  attachmentChunks: { text: string; source: string; pageNumber?: number | null }[]
  metadata: {
    subject: string
    grade?: string
    series?: string
    difficulty?: string
    lessonTitle?: string
  }
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


/**
 * Generate the prompt for RAG card generation
 * Combines lesson plan with document chunks for grounded generation
 */
export function getRAGCardPrompt(context: RAGContext, amount: number): string {
  const { lessonPlan, attachmentChunks, metadata } = context

  let prompt = `Tu es un expert en création de contenu éducatif pour le système scolaire ivoirien.
Tu dois créer des cartes d'étude PRÉCISES et FACTUELLES basées uniquement sur les informations fournies.

## Contexte de la leçon
- **Matière:** ${metadata.subject}
${metadata.lessonTitle ? `- **Titre:** ${metadata.lessonTitle}` : ''}
${metadata.grade ? `- **Niveau:** ${metadata.grade}` : ''}
${metadata.series ? `- **Série:** ${metadata.series}` : ''}
${metadata.difficulty ? `- **Difficulté:** ${metadata.difficulty}` : ''}

## Plan de leçon
${lessonPlan}
`

  // Add RAG context if available
  if (attachmentChunks.length > 0) {
    prompt += `
## Documents de référence (IMPORTANT: utilise ces informations pour créer des cartes précises)
Ces extraits proviennent des documents attachés à la leçon. Base tes cartes sur ces informations RÉELLES.
`
    for (const chunk of attachmentChunks) {
      const pageInfo = chunk.pageNumber ? ` (page ${chunk.pageNumber})` : ''
      prompt += `
### Source: ${chunk.source}${pageInfo}
\`\`\`
${chunk.text}
\`\`\`
`
    }
  }

  prompt += `
## Instructions de génération
Génère exactement **${amount} cartes d'étude** complètes basées sur le contenu ci-dessus.

### Règles CRITIQUES:
1. **FACTUEL**: Chaque carte doit être basée sur des informations RÉELLES du plan ou des documents
2. **PAS D'INVENTION**: Ne PAS inventer de faits, dates, noms ou données non présents dans les sources
3. **VARIÉTÉ**: Varier les niveaux de difficulté (0=facile, 1=moyen, 2=difficile)
4. **QUIZ PLAUSIBLE**: Les 4 options de quiz doivent être plausibles mais une seule correcte
5. **INDICES PROGRESSIFS**: Les hints doivent être progressifs (du plus vague au plus précis)
6. **RÉFÉRENCER**: Utilise sourceReference pour indiquer d'où vient l'information
7. **BLOOM**: Assigne un niveau de Bloom approprié (remember, understand, apply, analyze)
8. **FRANÇAIS IVOIRIEN**: Utilise un français approprié au niveau scolaire ivoirien

### Format de sortie
JSON array de ${amount} cartes avec cette structure:
{
  "title": "Titre concis (max 60 car.)",
  "frontContent": "Question/terme en Markdown",
  "backContent": "Réponse/définition en Markdown",
  "question": "Question quiz reformulée",
  "options": [
    { "id": "A", "text": "Option A", "isCorrect": false },
    { "id": "B", "text": "Option B", "isCorrect": true },
    { "id": "C", "text": "Option C", "isCorrect": false },
    { "id": "D", "text": "Option D", "isCorrect": false }
  ],
  "explanation": "Explication détaillée",
  "hints": ["Indice 1 (vague)", "Indice 2 (plus précis)"],
  "difficulty": 0|1|2,
  "sourceReference": "Nom du document ou section",
  "bloomsLevel": "remember|understand|apply|analyze"
}
`

  return prompt
}
