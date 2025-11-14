/**
 * Extended Lessons and Flashcards Seeding Script
 * Comprehensive educational content across all major subjects
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

import { initDatabase } from "./setup";
import { lessons, cards, subjects } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// ============================================================================
// SVT (Sciences de la Vie et de la Terre)
// ============================================================================

const svtLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Cellule et ses Composants",
      description: "Structure et fonction de la cellule eucaryote",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Quelles sont les deux grandes catégories de cellules?",
        backContent: "Les cellules procaryotes (sans noyau, comme les bactéries) et les cellules eucaryotes (avec noyau, comme les cellules animales et végétales).",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quel est le rôle de la mitochondrie?",
        backContent: "La mitochondrie est la centrale énergétique de la cellule. Elle produit l'ATP (adénosine triphosphate) par respiration cellulaire.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce que la photosynthèse?",
        backContent: "Processus par lequel les plantes convertissent l'énergie lumineuse en énergie chimique: 6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Quelle est la fonction du noyau cellulaire?",
        backContent: "Le noyau contient l'ADN et contrôle toutes les activités de la cellule. Il est le centre de commande de la cellule.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "La Génétique et l'Hérédité",
      description: "Les lois de Mendel et la transmission des caractères",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'un gène?",
        backContent: "Un gène est une séquence d'ADN qui code pour une protéine spécifique et détermine un caractère héréditaire.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quelle est la première loi de Mendel?",
        backContent: "La loi de ségrégation: les deux allèles d'un gène se séparent lors de la formation des gamètes, chaque gamète ne recevant qu'un seul allèle.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce qu'un allèle dominant?",
        backContent: "Un allèle qui s'exprime dans le phénotype même en présence d'un seul exemplaire (hétérozygote). Il masque l'allèle récessif.",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// ============================================================================
// HISTOIRE-GÉOGRAPHIE
// ============================================================================

const historyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Colonisation de l'Afrique",
      description: "Le partage de l'Afrique et ses conséquences",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce que la Conférence de Berlin (1884-1885)?",
        backContent: "Une conférence où les puissances européennes se sont partagé l'Afrique sans consulter les Africains. Elle a établi les règles de la colonisation.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quand la Côte d'Ivoire est-elle devenue indépendante?",
        backContent: "Le 7 août 1960. Félix Houphouët-Boigny est devenu le premier président de la République de Côte d'Ivoire.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce que l'assimilation coloniale?",
        backContent: "Une politique coloniale française visant à transformer les colonisés en citoyens français en adoptant la langue, la culture et les valeurs françaises.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Citez trois conséquences de la colonisation en Afrique",
        backContent: "1) Exploitation des ressources naturelles, 2) Imposition de frontières artificielles, 3) Introduction de nouvelles langues et systèmes éducatifs.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "La Première Guerre Mondiale",
      description: "Causes, déroulement et conséquences de la Grande Guerre",
      difficulty: "medium",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Quelles sont les dates de la Première Guerre mondiale?",
        backContent: "1914-1918. Elle a commencé le 28 juillet 1914 et s'est terminée le 11 novembre 1918.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce qui a déclenché la Première Guerre mondiale?",
        backContent: "L'assassinat de l'archiduc François-Ferdinand d'Autriche à Sarajevo le 28 juin 1914, qui a activé le système d'alliances européennes.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelles étaient les deux grandes alliances?",
        backContent: "La Triple-Entente (France, Royaume-Uni, Russie) et la Triple-Alliance (Allemagne, Autriche-Hongrie, Italie).",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// ============================================================================
// PHILOSOPHIE
// ============================================================================

const philosophyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Conscience et l'Inconscient",
      description: "Nature de la conscience et théories de l'inconscient",
      difficulty: "hard",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce que la conscience selon Descartes?",
        backContent: "Pour Descartes, la conscience est la connaissance immédiate que l'esprit a de lui-même et de ses pensées. 'Je pense, donc je suis' (Cogito).",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce que l'inconscient selon Freud?",
        backContent: "L'inconscient est la partie de notre psychisme qui échappe à la conscience mais qui influence nos pensées et comportements. Il contient les désirs refoulés.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelles sont les trois instances de l'appareil psychique selon Freud?",
        backContent: "Le Ça (pulsions), le Moi (réalité) et le Surmoi (morale). Ces trois instances sont en conflit permanent.",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
  {
    lesson: {
      title: "La Liberté et le Déterminisme",
      description: "Le débat entre libre arbitre et déterminisme",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le libre arbitre?",
        backContent: "La capacité de l'être humain à choisir et agir de manière autonome, sans être déterminé par des causes extérieures.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce que le déterminisme?",
        backContent: "La thèse selon laquelle tous les événements, y compris nos actions, sont causés par des facteurs antérieurs (biologiques, sociaux, psychologiques).",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelle est la position de Sartre sur la liberté?",
        backContent: "'L'homme est condamné à être libre'. Pour Sartre, l'existence précède l'essence: nous sommes totalement libres et responsables de nos choix.",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// ============================================================================
// ÉCONOMIE
// ============================================================================

const economicsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "L'Offre et la Demande",
      description: "Les mécanismes fondamentaux du marché",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce que la loi de l'offre?",
        backContent: "Toutes choses égales par ailleurs, lorsque le prix d'un bien augmente, la quantité offerte augmente. Les producteurs sont incités à produire plus.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Qu'est-ce que la loi de la demande?",
        backContent: "Toutes choses égales par ailleurs, lorsque le prix d'un bien augmente, la quantité demandée diminue. Les consommateurs achètent moins.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Qu'est-ce que le prix d'équilibre?",
        backContent: "Le prix auquel la quantité offerte est égale à la quantité demandée. C'est le point de rencontre des courbes d'offre et de demande.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Qu'est-ce que l'élasticité-prix de la demande?",
        backContent: "La mesure de la sensibilité de la quantité demandée aux variations de prix. Élasticité = (% variation quantité) / (% variation prix).",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
  {
    lesson: {
      title: "La Croissance Économique",
      description: "Mesure et facteurs de la croissance",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le PIB (Produit Intérieur Brut)?",
        backContent: "La valeur totale de tous les biens et services produits dans un pays pendant une période donnée (généralement un an).",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Quelle est la différence entre croissance et développement?",
        backContent: "La croissance est l'augmentation quantitative du PIB. Le développement inclut des aspects qualitatifs: santé, éducation, bien-être.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quels sont les trois facteurs de production?",
        backContent: "Le travail (main-d'œuvre), le capital (machines, équipements) et les ressources naturelles (terre, matières premières).",
        cardType: "basic",
        displayOrder: 3,
      },
    ],
  },
];

// ============================================================================
// ESPAGNOL
// ============================================================================

const spanishLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Los Verbos Irregulares",
      description: "Conjugaison des verbes irréguliers au présent",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date(),
    },
    cards: [
      {
        frontContent: "Conjuguez 'ser' (être) au présent",
        backContent: "Soy, eres, es, somos, sois, son. C'est un verbe très irrégulier utilisé pour les caractéristiques permanentes.",
        cardType: "basic",
        displayOrder: 1,
      },
      {
        frontContent: "Conjuguez 'estar' (être) au présent",
        backContent: "Estoy, estás, está, estamos, estáis, están. Utilisé pour les états temporaires et la localisation.",
        cardType: "basic",
        displayOrder: 2,
      },
      {
        frontContent: "Quelle est la différence entre 'ser' et 'estar'?",
        backContent: "'Ser' pour les caractéristiques permanentes (Soy alto), 'estar' pour les états temporaires (Estoy cansado) et la localisation.",
        cardType: "basic",
        displayOrder: 3,
      },
      {
        frontContent: "Conjuguez 'tener' (avoir) au présent",
        backContent: "Tengo, tienes, tiene, tenemos, tenéis, tienen. Verbe irrégulier très utilisé.",
        cardType: "basic",
        displayOrder: 4,
      },
    ],
  },
];

// ============================================================================
// SEEDING FUNCTION
// ============================================================================

export async function seedLessonsExtended() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting extended lessons seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const lessonsBySubject: Record<string, LessonWithCards[]> = {
      SVT: svtLessons,
      HG: historyLessons,
      PHILO: philosophyLessons,
      ECO: economicsLessons,
      ESP: spanishLessons,
    };

    let totalLessons = 0;
    let totalCards = 0;

    for (const [subjectAbbr, lessonsData] of Object.entries(lessonsBySubject)) {
      const subjectId = subjectsMap.get(subjectAbbr);

      if (!subjectId) {
        console.warn(`⚠️  Subject ${subjectAbbr} not found, skipping...`);
        continue;
      }

      console.log(`\n📚 Processing ${subjectAbbr}...`);

      for (const { lesson, cards: cardsData } of lessonsData) {
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

        const cardsToInsert = cardsData.map((card) => ({
          ...card,
          lessonId: insertedLesson.id,
        }));

        await db.insert(cards).values(cardsToInsert);
        console.log(`     📝 Added ${cardsToInsert.length} flashcards`);
        totalCards += cardsToInsert.length;
      }
    }

    console.log("\n🎉 Extended lessons seeding completed!");
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
    console.error("❌ Error seeding extended lessons:", error);
    throw error;
  }
}

if (require.main === module) {
  seedLessonsExtended()
    .then(() => {
      console.log("✨ Extended lessons seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Extended lessons seeding failed:", error);
      process.exit(1);
    });
}
