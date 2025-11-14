/**
 * Lessons and Flashcards Seeding Script
 * Populates the database with sample educational content
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../../.env") });

import { initDatabase } from "./setup";
import { lessons, cards, subjects } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";

// ============================================================================
// LESSON DATA BY SUBJECT
// ============================================================================

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// MATHÉMATIQUES
const mathLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Nombres Complexes",
      description: "Introduction aux nombres complexes et leurs opérations",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'un nombre complexe?",
        backContent: "Un nombre complexe est un nombre de la forme z = a + bi, où a et b sont des nombres réels et i est l'unité imaginaire (i² = -1).",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Comment calculer le module d'un nombre complexe z = a + bi?",
        backContent: "Le module est |z| = √(a² + b²). C'est la distance du point (a,b) à l'origine dans le plan complexe.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelle est la forme trigonométrique d'un nombre complexe?",
        backContent: "z = r(cos θ + i sin θ), où r est le module et θ est l'argument du nombre complexe.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Comment additionner deux nombres complexes z₁ = a + bi et z₂ = c + di?",
        backContent: "z₁ + z₂ = (a + c) + (b + d)i. On additionne séparément les parties réelles et imaginaires.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "Les Fonctions Exponentielles",
      description: "Étude des propriétés et applications des fonctions exponentielles",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Quelle est la dérivée de f(x) = eˣ?",
        backContent: "f'(x) = eˣ. La fonction exponentielle est sa propre dérivée.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quelle est la propriété fondamentale de l'exponentielle?",
        backContent: "eᵃ × eᵇ = eᵃ⁺ᵇ. Le produit d'exponentielles est l'exponentielle de la somme.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelle est la limite de eˣ quand x tend vers +∞?",
        backContent: "lim(x→+∞) eˣ = +∞. La fonction exponentielle croît plus vite que toute fonction polynomiale.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Comment résoudre l'équation eˣ = 5?",
        backContent: "x = ln(5). On applique le logarithme népérien des deux côtés de l'équation.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "Les Suites Numériques",
      description: "Suites arithmétiques, géométriques et leurs propriétés",
      difficulty: "easy",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une suite arithmétique?",
        backContent: "Une suite (uₙ) est arithmétique si uₙ₊₁ = uₙ + r, où r est la raison constante.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Comment calculer le terme général d'une suite arithmétique?",
        backContent: "uₙ = u₀ + nr, où u₀ est le premier terme et r la raison.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce qu'une suite géométrique?",
        backContent: "Une suite (uₙ) est géométrique si uₙ₊₁ = uₙ × q, où q est la raison constante.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Comment calculer la somme des n premiers termes d'une suite géométrique?",
        backContent: "Sₙ = u₀ × (1 - qⁿ)/(1 - q) si q ≠ 1, où u₀ est le premier terme.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
];

// FRANÇAIS
const frenchLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Figures de Style",
      description: "Métaphore, comparaison, personnification et autres figures",
      difficulty: "medium",
      estimatedDuration: 35,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une métaphore?",
        backContent: "Une métaphore est une figure de style qui établit une comparaison implicite entre deux éléments sans utiliser d'outil de comparaison. Ex: 'La vie est un long fleuve tranquille'.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quelle est la différence entre métaphore et comparaison?",
        backContent: "La comparaison utilise un outil de comparaison (comme, tel que, semblable à), tandis que la métaphore établit une identification directe sans outil.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce qu'une personnification?",
        backContent: "La personnification attribue des caractéristiques humaines à un objet, un animal ou une idée abstraite. Ex: 'Le vent hurle dans la nuit'.",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
  {
    lesson: {
      title: "L'Argumentation",
      description: "Techniques d'argumentation et structure du texte argumentatif",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Quels sont les trois éléments essentiels d'une argumentation?",
        backContent: "1) La thèse (idée défendue), 2) Les arguments (raisons qui soutiennent la thèse), 3) Les exemples (illustrations concrètes).",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce qu'un argument d'autorité?",
        backContent: "Un argument qui s'appuie sur l'avis d'un expert ou d'une personne reconnue dans le domaine pour renforcer la thèse.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelle est la structure d'un paragraphe argumentatif?",
        backContent: "1) Argument principal, 2) Explication de l'argument, 3) Exemple concret, 4) Lien avec la thèse.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Qu'est-ce qu'une concession dans l'argumentation?",
        backContent: "Reconnaître la validité d'un argument adverse avant de le réfuter ou de montrer que votre thèse reste plus forte.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
];

// ANGLAIS
const englishLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Present Perfect vs Simple Past",
      description: "Understanding the difference between present perfect and simple past tenses",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "When do we use the Present Perfect?",
        backContent: "We use Present Perfect for actions that happened at an unspecified time in the past or that have a connection to the present. Form: have/has + past participle.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "When do we use the Simple Past?",
        backContent: "We use Simple Past for completed actions at a specific time in the past. Form: verb + -ed (regular) or irregular past form.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Which tense: 'I _____ (visit) Paris last year'?",
        backContent: "Simple Past: 'I visited Paris last year' - because we have a specific time reference ('last year').",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Which tense: 'I _____ (never/be) to Japan'?",
        backContent: "Present Perfect: 'I have never been to Japan' - because there's no specific time and it relates to life experience up to now.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "Conditional Sentences",
      description: "Zero, first, second, and third conditional structures",
      difficulty: "hard",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "What is the structure of the First Conditional?",
        backContent: "If + present simple, will + infinitive. Used for real and possible situations in the future. Ex: 'If it rains, I will stay home.'",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "What is the structure of the Second Conditional?",
        backContent: "If + past simple, would + infinitive. Used for unreal or unlikely situations in the present/future. Ex: 'If I won the lottery, I would travel the world.'",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "What is the structure of the Third Conditional?",
        backContent: "If + past perfect, would have + past participle. Used for unreal situations in the past. Ex: 'If I had studied harder, I would have passed the exam.'",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// PHYSIQUE-CHIMIE
const physicsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Lois de Newton",
      description: "Les trois lois fondamentales de la mécanique classique",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Énoncez la première loi de Newton (principe d'inertie)",
        backContent: "Un corps reste au repos ou en mouvement rectiligne uniforme si la somme des forces qui s'exercent sur lui est nulle.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Énoncez la deuxième loi de Newton (principe fondamental de la dynamique)",
        backContent: "F = ma, où F est la force résultante, m la masse et a l'accélération. La force est égale au produit de la masse par l'accélération.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Énoncez la troisième loi de Newton (principe d'action-réaction)",
        backContent: "À toute action correspond une réaction égale et opposée. Si un corps A exerce une force sur un corps B, alors B exerce sur A une force de même intensité mais de sens opposé.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Quelle est l'unité de la force dans le système international?",
        backContent: "Le Newton (N). 1 N = 1 kg⋅m⋅s⁻²",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "Les Réactions Chimiques",
      description: "Équilibrage et types de réactions chimiques",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une réaction de combustion?",
        backContent: "Une réaction chimique où une substance réagit avec l'oxygène en produisant de la chaleur et de la lumière. Ex: CH₄ + 2O₂ → CO₂ + 2H₂O",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce que la loi de conservation de la masse?",
        backContent: "Dans une réaction chimique, la masse totale des réactifs est égale à la masse totale des produits. Rien ne se perd, rien ne se crée, tout se transforme (Lavoisier).",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce qu'une réaction acido-basique?",
        backContent: "Une réaction où un acide (donneur de protons H⁺) réagit avec une base (accepteur de protons) pour former un sel et de l'eau.",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// ============================================================================
// SEEDING FUNCTION
// ============================================================================

export async function seedLessons() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting lessons and flashcards seeding...");

  try {
    // Get all subjects
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    // Mapping of lessons to subjects
    const lessonsBySubject: Record<string, LessonWithCards[]> = {
      MATH: mathLessons,
      FR: frenchLessons,
      ANG: englishLessons,
      PC: physicsLessons,
    };

    let totalLessons = 0;
    let totalCards = 0;

    // Insert lessons and cards for each subject
    for (const [subjectAbbr, lessonsData] of Object.entries(lessonsBySubject)) {
      const subjectId = subjectsMap.get(subjectAbbr);

      if (!subjectId) {
        console.warn(`⚠️  Subject ${subjectAbbr} not found, skipping...`);
        continue;
      }

      console.log(`\n📚 Processing ${subjectAbbr}...`);

      for (const { lesson, cards: cardsData } of lessonsData) {
        // Insert lesson
        const [insertedLesson] = await db
          .insert(lessons)
          .values({
            ...lesson,
            subjectId,
          })
          .returning();

        if (!insertedLesson) {
          throw new Error(`Failed to insert lesson: ${lesson.title}`);
        }

        console.log(`  ✅ Created lesson: ${lesson.title}`);
        totalLessons++;

        // Insert cards for this lesson
        const cardsToInsert = cardsData.map((card) => ({
          ...card,
          lessonId: insertedLesson.id,
        }));

        await db.insert(cards).values(cardsToInsert);
        console.log(`     📝 Added ${cardsToInsert.length} flashcards`);
        totalCards += cardsToInsert.length;
      }
    }

    console.log("\n🎉 Lessons seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding lessons:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedLessons()
    .then(() => {
      console.log("✨ Lessons seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Lessons seeding failed:", error);
      process.exit(1);
    });
}
