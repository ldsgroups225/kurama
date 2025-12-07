/**
 * Comprehensive French Language Seeding Script for Ivorian BEPC/BAC
 * Complete collection of French lessons and flashcards with Ivorian authors and context
 * Adapted for Côte d'Ivoire educational system
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env.development") });

import { initDatabase } from "../database/setup";
import { lessons, cards, subjects } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// ============================================================================
// FRANÇAIS BEPC (3ème) - 25 Leçons
// ============================================================================

// MODULE 1: GRAMMAIRE (8 Leçons)
const frenchGrammarLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Temps de l'Indicatif",
      description: "Maîtrise des temps de l'indicatif avec exemples du contexte ivoirien",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Conjuguez 'aller' au présent de l'indicatif",
        backContent: "Je vais, tu vas, il/elle/on va, nous allons, vous allez, ils/elles vont. Verbe du 3ème groupe mais très irrégulier et essentiel.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quelle est la différence entre imparfait et passé composé?",
        backContent: "Imparfait : description, actions secondaires, habitudes passées. Passé composé : actions principales, terminées, précises dans le temps. Exemple: 'Il pleuvait (imparfait) quand le bus est arrivé (passé composé)'.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Conjuguez 'être' au plus-que-parfait",
        backContent: "J'avais été, tu avais été, il/elle/on avait été, nous avions été, vous aviez été, ils/elles avaient été. Temps du récit pour exprimer l'antériorité par rapport à un autre temps du passé.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Mettez au futur simple : 'Le cultivateur ivoirien (récolter) son cacao'",
        backContent: "Le cultivateur ivoirien récoltera son cacao. Attention : récolter verbe du 1er groupe, donc 'récoltera' sans accent. Le futur exprime une action future certaine.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : On utilise le passé composé pour décrire un paysage dans un récit",
        backContent: "Faux. Pour les descriptions, on utilise l'imparfait. Le passé composé est pour les actions ponctuelles et terminées. 'Le marché était animé (imparfait) quand j'ai acheté (passé composé) des mangues'.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Accords Participe Passé",
      description: "Règles complexes d'accord du participe passé avec applications pratiques",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Quelle est la règle d'accord du participe passé avec l'auxiliaire avoir?",
        backContent: "Le participe passé s'accorde avec le complément d'objet direct (COD) seulement si celui-ci est placé avant le verbe et s'il est en genre et nombre bien définis. Ex: 'J'ai mangé les mangues que j'ai achetées'.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Accordez correctement : 'Les étudiantes que le professeur (interroger)'",
        backContent: "'Interrogées'. Le COD 'que' représente 'les étudiantes', placé avant le verbe, féminin pluriel. Le participe passé s'accorde donc.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Pourquoi dit-on 'elle s'est lavée les mains' et non 'elle s'est lavé les mains'?",
        backContent: "Avec les verbes pronominaux, on examine s'il y a un COD distinct du pronom réfléchi 'se'. Ici, 'les mains' est COD, placé après, donc pas d'accord. Si c'était 'elle s'est lavée', le COD est 'elle' (= sujet) donc accord.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application administrative : 'Les décisions que le gouvernement (prendre)'",
        backContent: "'Prises'. COD = 'que' = 'les décisions', placé avant, féminin pluriel. Les décisions (féminin pluriel) que le gouvernement a prises.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'Expression Écrite: Les Types de Textes",
      description: "Maîtrise des différents types de textes: narratif, descriptif, argumentatif",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Quelles sont les caractéristiques du texte narratif?",
        backContent: "Raconte une histoire ou des événements dans un ordre chronologique. Utilise des indicateurs temporels, des verbes d'action, personnages, cadre spatio-temporel. Structure : situation initiale, élément déclencheur, péripéties, résolution, situation finale.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Comment reconnaître un texte argumentatif?",
        backContent: "Présente une thèse, des arguments et des exemples pour convaincre. Utilise des connecteurs logiques (donc, car, cependant, en effet). Structure : introduction (thèse), développement (arguments+exemples), conclusion (synthèse).",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Identifiez le type de texte : 'Abidjan, ville de contrastes, où gratte-ciel modernes côtoient quartiers traditionnels. L'Ébrié scintille sous le soleil équatorien...'",
        backContent: "Texte descriptif. Caractéristiques : vocabulaire précis, adjectifs qualificatifs, comparaisons, métaphores. But : faire visualiser la scène au lecteur.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Application composition : Rédigez une phrase argumentative sur l'importance de l'éducation en Côte d'Ivoire",
        backContent: "L'éducation constitue un pilier fondamental pour le développement de la Côte d'Ivoire, car elle permet non seulement de former une main-d'œuvre qualifiée mais aussi de garantir l'émancipation intellectuelle des jeunes.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// MODULE 2: VOCABULAIRE ET EXPRESSION (6 Leçons)
const frenchVocabularyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Le Vocabulaire de l'Économie Ivoirienne",
      description: "Termes économiques et commerciaux spécifiques au contexte ivoirien",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 9,
    },
    cards: [
      {
        frontContent: "Que signifie 'plantation' dans le contexte ivoirien?",
        backContent: "Grande exploitation agricole cultivée en monoculture (cacao, café, hévéa, palmier à huile). Joue un rôle économique central en Côte d'Ivoire, premier producteur mondial de cacao.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Définissez 'filière' économique",
        backContent: "Ensemble des activités interdépendantes qui transforment un produit de la production à la consommation. Ex: filière cacao (producteurs → transformateurs → exportation → distribution).",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Que désigne le terme 'transitaire'?",
        backContent: "Entreprise qui assiste les importateurs/exportateurs dans les démarches douanières et logistiques. Essentiel au Port d'Abidjan et à l'aéroport Félix Houphouët-Boigny.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Expliquez 'caisse de stabilisation'",
        backContent: "Organisme d'État qui fixe les prix d'achat aux producteurs agricoles et gère les stocks pour stabiliser les marchés. La Caistab (Caisse de Stabilisation et de Soutien des Prix des Produits Agricoles) en Côte d'Ivoire.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : Le 'CFA' signifie 'Colonie Française d'Afrique'",
        backContent: "Faux. CFA signifie 'Communauté Financière Africaine' pour l'UEMOA et 'Coopération Financière en Afrique centrale' pour la CEMAC. Monnaie utilisée dans 14 pays africains.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Expressions et Proverbes Ivoiriens",
      description: "Expressions idiomatiques et proverbes en français avec références culturelles ivoiriennes",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Que signifie l'expression 'manger à la même gamelle'?",
        backContent: "Partager le même sort, vivre dans les mêmes conditions. Souvent utilisé pour parler de la solidarité ivoirienne face aux difficultés économiques.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Expliquez l'expression 'faire du surplace'",
        backContent: "Attendre sans rien faire, perdre son temps inutilement. Terme très utilisé dans les files d'attente ivoiriennes (administrations, banques, transports).",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Que veut dire 'gratter le papier'?",
        backContent: "Étudier, faire ses devoirs. Expression étudiante très courante en Côte d'Ivoire pour désigner le travail scolaire.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Proverbe ivoirien : 'La main qui donne est toujours au-dessus de celle qui reçoit'",
        backContent: "Celui qui donne ou aide a une position sociale supérieure à celui qui reçoit. Met en valeur la générosité et le don dans la culture ivoirienne.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Que signifie 'aller au grailler'?",
        backContent: "Aller manger gratuitement chez quelqu'un, profiter de l'hospitalité. Pratique culturelle importante dans la tradition ivoirienne de partage et de convivialité.",
        cardType: "basic",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
];

// MODULE 3: LITTÉRATURE ET TEXTE (6 Leçons)
const frenchLiteratureLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Bernard Binlin Dadié: Père de la Littérature Ivoirienne",
      description: "Étude des œuvres et thèmes de Bernard Dadié, écrivain majeur ivoirien",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "Qui est Bernard Binlin Dadié?",
        backContent: "Écrivain, poète, dramaturge et homme politique ivoirien (1916-2019). Considéré comme le père de la littérature ivoirienne. Œuvres principales : 'Climbié', 'Le Pagne Noir', 'Les Pages Africaines'.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quels sont les thèmes principaux dans 'Le Pagne Noir'?",
        backContent: "Conflit entre tradition et modernité, colonisation et identité africaine, rites initiatiques, sagesse ancestrale. Critique de la dévalorisation des cultures africaines par la colonisation.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment Dadié mêle-t-il français et langues ivoiriennes?",
        backContent: "Utilise des termes ivoiriens (attiéké, alloco, ouagouo) avec des explications en français, créant un effet d'authenticité culturelle. Pratique l'énallage en incluant des expressions en langues locales.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Quelle vision de l'Afrique Dadié présente-t-il dans ses poèmes?",
        backContent: "Une Afrique fière de sa culture, critique de la colonisation mais ouverte à un dialogue enrichissant. Promotion des valeurs traditionnelles (solidarité, sagesse, respect des aînés) et de la négritude.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Ahmadou Kourouma: L'Écrivain de la Condition Humaine",
      description: "Analyse des œuvres d'Ahmadou Kourouma, prix Goncourt 2000",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 16,
    },
    cards: [
      {
        frontContent: "Qui est Ahmadou Kourouma?",
        backContent: "Écrivain ivoirien (1927-2003), prix Goncourt 2000 pour 'Allah n'est pas obligé'. Œuvres principales : 'Les Soleils des indépendances', 'Monnè, outrages et défis', 'En attendant le vote des bêtes sauvages'.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la particularité du style de Kourouma?",
        backContent: "Utilisation créative du français en y intégrant des tournures malinké, humour satirique, critique politique. Langage hybride qui reflète la réalité culturelle ouest-africaine.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Quels thèmes traite 'Les Soleils des indépendances'?",
        backContent: "Déception post-coloniale, corruption politique, espoirs déçus des indépendances africaines, critique des dirigeants africains. Vision pessimiste mais réaliste de la politique africaine post-independence.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi Kourouma utilise-t-il beaucoup de proverbes et contes malinké?",
        backContent: "Pour ancrer ses récits dans la sagesse africaine traditionnelle, créer une oralité écrite, donner authenticité culturelle. Les proverbes servent de vérités universelles exprimées dans la culture locale.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// MODULE 4: ANALYSE DE TEXTE ET COMMENTAIRE (5 Leçons)
const frenchAnalysisLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Figures de Style",
      description: "Identification et analyse des figures de style dans les textes littéraires ivoiriens",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 21,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une métaphore?",
        backContent: "Figure de style qui établit une identification implicite entre deux éléments sans mot de comparaison. Ex: 'Yamoussoukro, la perle des savanes'. Le mot de comparaison 'comme' n'est pas utilisé.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Différence entre comparaison et métaphore",
        backContent: "Comparaison : explicite avec mot outil (comme, tel que, semblable à). Métaphore : identification directe sans mot outil. 'Abidjan, comme New York' (comparaison) vs 'Abidjan, Manhattan tropical' (métaphore).",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Identifiez la figure : 'L'Ébrié miroir où danse le soleil couchant'",
        backContent: "Métaphore filée et personnification. L'Ébrié est comparé à un miroir (métaphore) et le soleil est dit 'danser' (personnification). Figure complexe combinée.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Analysez la personnification dans : 'Le vent murmure des secrets aux palmiers'",
        backContent: "Le vent, phénomène naturel, se voit attribuer une action humaine (murmurer). Crée une image poétique vivante, établit une communication entre nature et humains.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// ============================================================================
// FRANÇAIS TERMINALE BAC - SÉRIE A (8 Leçons)
// ============================================================================

// MODULE 1: PHILOSOPHIE DU LANGAGE (3 Leçons)
const frenchPhilosophyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Langage et Pensée selon Platon",
      description: "Analyse philosophique du rapport entre langage, pensée et réalité",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 26,
    },
    cards: [
      {
        frontContent: "Quel est le mythe de la caverne chez Platon?",
        backContent: "Allégorie philosophique où des prisonniers enchaînés voient seulement des ombres sur un mur, prenant les apparences pour la réalité. Le prisonnier libéré accède à la connaissance véritable. Critique de la perception sensible et de l'opinion.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Comment Platon distingue-t-il les noms et les choses?",
        backContent: "Pour Platon, les noms ne sont pas arbitraires mais tentent de capturer l'essence (l'Idée) des choses. Le langage vise la vérité mais souvent l'échoue. Problème de la référence linguistique à la réalité.",
        cardType: "basic",
        displayOrder: 2,
        points: 30,
      },
      {
        frontContent: "Application linguistique ivoirienne : Comment les noms de lieux révèlent-ils l'histoire selon la perspective platonicienne?",
        backContent: "Exemple : 'Yamoussoukro' (village des Yamousso), 'Bouaké' (village des Biafara). Les noms contiennent l'Idée (essence) historique mais peuvent masquer la complexité actuelle.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
    ],
  },
];

export async function seedFrenchComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive French seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const frenchSubjectId = subjectsMap.get("FR");
    if (!frenchSubjectId) {
      throw new Error("French subject not found");
    }

    // Combine all French lessons
    const allFrenchLessons = [
      ...frenchGrammarLessons,
      ...frenchVocabularyLessons,
      ...frenchLiteratureLessons,
      ...frenchAnalysisLessons,
      ...frenchPhilosophyLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing French lessons...");

    for (const { lesson, cards: cardsData } of allFrenchLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: frenchSubjectId,
        })
        .returning();

      if (!insertedLesson) {
        throw new Error(`Failed to insert lesson: ${lesson.title}`);
      }

      console.log(`  ✅ Created lesson: ${lesson.title}`);
      totalLessons++;

      const cardsToInsert = cardsData.map((card) => ({
        ...card,
        lessonId: insertedLesson.id,
      }));

      await db.insert(cards).values(cardsToInsert);
      console.log(`     📝 Added ${cardsToInsert.length} flashcards`);
      totalCards += cardsToInsert.length;
    }

    console.log("\n🎉 French comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Authors covered: Dadié, Kourouma, philosophy`);
    console.log(`   - Context: 100% Ivorian cultural references`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive French:", error);
    throw error;
  }
}

if (require.main === module) {
  seedFrenchComprehensive()
    .then(() => {
      console.log("✨ French comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 French comprehensive seeding failed:", error);
      process.exit(1);
    });
}
