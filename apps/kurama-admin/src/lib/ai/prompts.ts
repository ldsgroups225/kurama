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
 * Generate the prompt for lesson plan generation
 * Optimized for Gemini with Google Search grounding
 */
export function getLessonPlanPrompt(params: LessonPlanPromptParams): string {
  const { country, subject, grade, language, schoolYear, lessonTitle, customInstructions } = params

  const isFrench = language === 'French'
  const isIvoryCoast = country.toLowerCase().includes('ivoire') || country.toLowerCase().includes('ivory')

  let prompt = `<role>Expert pedagogue specialise dans la conception de programmes scolaires ${isIvoryCoast ? 'ivoiriens' : 'africains'}.</role>

<task>Creer un plan de lecon complet et structure pour l'enseignement.</task>

<context>
- Pays: ${country}
- Niveau: ${grade}
- Matiere: ${subject}
- Annee scolaire: ${schoolYear}
- Titre exact: "${lessonTitle}"
</context>

<search_priority>
${isIvoryCoast
  ? `1. dpfc-ci.net (Direction de la Pedagogie et de la Formation Continue - OFFICIEL)
2. men-dpes.org (Ministere de l'Education Nationale)
3. ecoleweb.ci (ressources pedagogiques ivoiriennes)
4. scribd.com/documents educatifs Cote d'Ivoire`
  : `1. Sites officiels du ministere de l'education de ${country}
2. Ressources pedagogiques officielles
3. Documents curriculaires nationaux`}
</search_priority>

<output_format>
# ${lessonTitle}

### Objectifs d'apprentissage
- Objectif general (ce que l'eleve saura faire)
- 3-5 objectifs specifiques mesurables (verbes d'action: definir, expliquer, calculer, analyser...)
- Competences visees selon le programme officiel

### Prerequis
- Connaissances prealables necessaires
- Notions a maitriser avant cette lecon

### Duree estimee
- Temps total recommande
- Repartition par activite

### Materiel requis
- Materiel pour l'enseignant
- Materiel pour les eleves
- Ressources numeriques (si applicable)

### Contenu de la lecon
#### Introduction / Situation de depart
- Accroche ou situation-probleme
- Lien avec le vecu des eleves

#### Developpement
- Concepts cles avec definitions precises
- Explications detaillees
- Exemples concrets adaptes au contexte ${isIvoryCoast ? 'ivoirien' : 'local'}
- Formules (si applicable, en LaTeX: $formule$)

#### Synthese
- Points essentiels a retenir
- Schema ou resume visuel

### Activites etape par etape
1. **Phase de decouverte** (X min): description
2. **Phase d'apprentissage** (X min): description
3. **Phase d'application** (X min): exercices guides
4. **Phase d'evaluation** (X min): verification des acquis

### Exercices d'application
- 2-3 exercices de difficulte croissante
- Corriges ou elements de reponse

### Methodes d'evaluation
- Evaluation formative (pendant la lecon)
- Evaluation sommative (criteres de reussite)
- Indicateurs de maitrise

### Prolongements
- Liens avec d'autres lecons
- Activites complementaires

### Cartes d'etude recommandees
- Nombre de cartes suggere: X cartes (basé sur la complexite et le nombre de concepts)
- Repartition recommandee:
  - X cartes faciles (definitions, faits de base)
  - X cartes moyennes (applications, relations)
  - X cartes difficiles (analyse, synthese)
- Concepts cles a couvrir en priorite (liste)
</output_format>

<rules>
1. LANGUE: Rediger entierement en ${isFrench ? 'francais' : 'anglais'}
2. PRECISION: Utiliser des informations verifiees du programme officiel
3. ADAPTATION: Adapter les exemples au contexte ${isIvoryCoast ? 'ivoirien' : 'local'}
4. FORMULES: Utiliser LaTeX pour les mathematiques ($x^2$, $\\frac{a}{b}$)
5. STRUCTURE: Respecter exactement les en-tetes demandes
6. EXHAUSTIVITE: Couvrir tous les aspects du titre "${lessonTitle}"
</rules>`

  if (customInstructions) {
    prompt += `

<custom_instructions>
${customInstructions}
</custom_instructions>`
  }

  return prompt
}

/**
 * Generate the prompt for complete card generation (flashcard + quiz in one)
 * Optimized for structured output with Gemini
 */
export function getCompleteCardPrompt(params: CardGenerationPromptParams): string {
  const { lessonContent, amount } = params

  // Calculate distribution for variety
  const easyCount = Math.ceil(amount * 0.3)
  const mediumCount = Math.ceil(amount * 0.4)
  const hardCount = amount - easyCount - mediumCount

  return `<role>Expert en creation de contenu educatif et techniques de memorisation (spaced repetition).</role>

<task>Creer ${amount} cartes d'etude optimisees pour l'apprentissage actif.</task>

<lesson_content>
${lessonContent}
</lesson_content>

<card_structure>
Chaque carte contient:
1. title: Titre concis (max 60 car.)
2. frontContent: Question/terme (Markdown, LaTeX pour maths)
3. backContent: Reponse complete (Markdown, LaTeX)
4. question: Question QCM differente du frontContent
5. options: 4 choix [A,B,C,D] - 1 seule correcte, distracteurs plausibles
6. explanation: Pourquoi la reponse est correcte
7. hints: 2 indices progressifs (vague puis precis)
8. difficulty: 0=facile, 1=moyen, 2=difficile
</card_structure>

<distribution>
- ${easyCount} faciles (difficulty:0) - definitions, faits simples
- ${mediumCount} moyennes (difficulty:1) - applications, relations
- ${hardCount} difficiles (difficulty:2) - analyse, synthese
</distribution>

<quality_rules>
- COUVERTURE: Tous les concepts importants de la lecon
- UNICITE: 1 carte = 1 concept unique
- PRECISION: Informations exactes uniquement
- DISTRACTEURS: Bases sur erreurs courantes des eleves
- FORMULES: LaTeX obligatoire pour maths ($x^2$, $\\frac{a}{b}$)
- VARIETE: Varier position de la bonne reponse (pas toujours B)
</quality_rules>

<output_format>
JSON array de ${amount} cartes:
{
  "title": "string",
  "frontContent": "string (Markdown)",
  "backContent": "string (Markdown)",
  "question": "string",
  "options": [
    {"id": "A", "text": "string", "isCorrect": boolean},
    {"id": "B", "text": "string", "isCorrect": boolean},
    {"id": "C", "text": "string", "isCorrect": boolean},
    {"id": "D", "text": "string", "isCorrect": boolean}
  ],
  "explanation": "string",
  "hints": ["string", "string"],
  "difficulty": 0|1|2
}
</output_format>`
}

/**
 * Generate the prompt for RAG-enhanced card generation
 * Combines lesson plan with document chunks for grounded generation
 */
export function getRAGCardPrompt(context: RAGContext, amount: number): string {
  const { lessonPlan, attachmentChunks, metadata } = context

  // Calculate distribution
  const easyCount = Math.ceil(amount * 0.3)
  const mediumCount = Math.ceil(amount * 0.4)
  const hardCount = amount - easyCount - mediumCount

  let prompt = `<role>Expert en creation de contenu educatif pour le systeme scolaire ivoirien.</role>

<task>Creer ${amount} cartes d'etude PRECISES et FACTUELLES basees sur les sources fournies.</task>

<context>
- Matiere: ${metadata.subject}
${metadata.lessonTitle ? `- Titre: ${metadata.lessonTitle}` : ''}
${metadata.grade ? `- Niveau: ${metadata.grade}` : ''}
${metadata.series ? `- Serie: ${metadata.series}` : ''}
${metadata.difficulty ? `- Difficulte: ${metadata.difficulty}` : ''}
</context>

<lesson_plan>
${lessonPlan}
</lesson_plan>
`

  // Add RAG context if available
  if (attachmentChunks.length > 0) {
    prompt += `
<reference_documents>
IMPORTANT: Ces extraits sont la SOURCE DE VERITE. Base tes cartes sur ces informations REELLES.
`
    for (const [i, chunk] of attachmentChunks.entries()) {
      const pageInfo = chunk.pageNumber ? ` (page ${chunk.pageNumber})` : ''
      prompt += `
[Source ${i + 1}: ${chunk.source}${pageInfo}]
${chunk.text}
`
    }
    prompt += `</reference_documents>
`
  }

  prompt += `
<critical_rules>
1. FACTUEL: Chaque carte basee sur informations REELLES des sources
2. PAS D'INVENTION: Ne PAS inventer faits, dates, noms non presents
3. REFERENCE: Indiquer sourceReference pour chaque carte
4. BLOOM: Assigner niveau taxonomique (remember, understand, apply, analyze)
5. VARIETE: Difficultes variees selon distribution ci-dessous
</critical_rules>

<distribution>
- ${easyCount} faciles (difficulty:0, bloomsLevel:remember/understand)
- ${mediumCount} moyennes (difficulty:1, bloomsLevel:understand/apply)
- ${hardCount} difficiles (difficulty:2, bloomsLevel:apply/analyze)
</distribution>

<output_format>
JSON array de ${amount} cartes:
{
  "title": "Titre concis (max 60 car.)",
  "frontContent": "Question/terme en Markdown",
  "backContent": "Reponse/definition en Markdown",
  "question": "Question quiz reformulee",
  "options": [
    {"id": "A", "text": "Option A", "isCorrect": false},
    {"id": "B", "text": "Option B", "isCorrect": true},
    {"id": "C", "text": "Option C", "isCorrect": false},
    {"id": "D", "text": "Option D", "isCorrect": false}
  ],
  "explanation": "Explication detaillee",
  "hints": ["Indice 1 (vague)", "Indice 2 (plus precis)"],
  "difficulty": 0|1|2,
  "sourceReference": "Nom du document ou section",
  "bloomsLevel": "remember|understand|apply|analyze"
}
</output_format>`

  return prompt
}
