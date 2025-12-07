/**
 * Comprehensive ECM (Éducation Civique et Morale) / EDHC Seeding Script
 * Complete collection of ECM/EDHC lessons and flashcards for Ivorian BEPC/BAC
 * Adapted for Côte d'Ivoire educational system
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env.development") });

import { initDatabase } from "../database/setup";
import { lessons, cards } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// ============================================================================
// ECM / EDHC BEPC (3ème)
// ============================================================================

const bepcECMLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Symboles de la République et la Citoyenneté",
      description: "Connaissance et respect des symboles de l'État ivoirien et valeurs citoyennes",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Quels sont les 5 symboles de la République de Côte d'Ivoire ?",
        backContent: "1. Le drapeau (Orange-Blanc-Vert)\n2. L'hymne national (L'Abidjanaise)\n3. La devise (Union-Discipline-Travail)\n4. Les armoiries\n5. Le portrait du Chef de l'État",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Que signifient les couleurs du drapeau ivoirien ?",
        backContent: "Orange : l'éclat de la floraison nationale et les savanes du Nord.\nBlanc : la paix et la pureté.\nVert : l'espérance et la forêt du Sud.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Vrai ou Faux : Le respect des symboles de la République est un devoir pour tout citoyen.",
        backContent: "Vrai. C'est une obligation civique fondamentale qui marque l'attachement à la nation.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 3,
        points: 10,
      },
      {
        frontContent: "Qu'est-ce que la citoyenneté ?",
        backContent: "C'est la qualité d'une personne reconnue comme membre d'un État, qui jouit de droits civils et politiques et a des devoirs envers cet État.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Droits de l'Homme et de l'Enfant",
      description: "Compréhension des droits fondamentaux et protection des enfants",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Citez 3 droits fondamentaux de l'enfant selon la CDE.",
        backContent: "Droit à l'éducation, droit à la santé, droit à une identité (nom et nationalité), droit à la protection contre les violences.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que la CDE ?",
        backContent: "La Convention relative aux Droits de l'Enfant, adoptée par l'ONU en 1989.",
        cardType: "basic",
        displayOrder: 2,
        points: 10,
      },
      {
        frontContent: "Vrai ou Faux : Le travail des enfants de moins de 16 ans est autorisé en Côte d'Ivoire dans les plantations.",
        backContent: "Faux. Le travail dangereux et l'exploitation des enfants sont interdits par la loi pour protéger leur développement et leur éducation.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que le droit de vote ?",
        backContent: "C'est le droit pour les citoyens majeurs de choisir leurs représentants politiques. C'est un droit politique fondamental.",
        cardType: "basic",
        displayOrder: 4,
        points: 10,
      },
    ],
  },
  {
    lesson: {
      title: "La Démocratie et les Institutions de la République",
      description: "Fonctionnement de l'État, séparation des pouvoirs et processus électoral",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Quels sont les trois pouvoirs dans un État démocratique ?",
        backContent: "1. Le pouvoir Exécutif (Président, Gouvernement)\n2. Le pouvoir Législatif (Parlement : Assemblée Nationale et Sénat)\n3. Le pouvoir Judiciaire (Cours et Tribunaux)",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quel est le rôle de l'Assemblée Nationale ?",
        backContent: "Elle vote les lois et consent l'impôt. Elle contrôle également l'action du gouvernement.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Qui est le Chef suprême des Armées en Côte d'Ivoire ?",
        backContent: "Le Président de la République.",
        cardType: "basic",
        displayOrder: 3,
        points: 10,
      },
      {
        frontContent: "Qu'est-ce que la Constitution ?",
        backContent: "C'est la loi fondamentale de l'État qui définit les droits et libertés des citoyens ainsi que l'organisation et les rapports entre les pouvoirs publics.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "La Cohésion Sociale et la Culture de la Paix",
      description: "Vivre ensemble, tolérance et gestion pacifique des conflits",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 4,
    },
    cards: [
      {
        frontContent: "Définissez la cohésion sociale.",
        backContent: "C'est la capacité d'une société à assurer le bien-être de tous ses membres, à minimiser les disparités et à éviter la polarisation. C'est le 'vivre ensemble' harmonieux.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que la tolérance ?",
        backContent: "C'est le respect, l'acceptation et l'appréciation de la richesse et de la diversité des cultures, des modes d'expression et des manières d'exprimer notre qualité d'êtres humains.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Citez deux mécanismes traditionnels de règlement des conflits en Côte d'Ivoire.",
        backContent: "La médiation par les chefs coutumiers ou religieux, et les alliances inter-ethniques (ex: le 'toukpè' ou parenté à plaisanterie).",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : La discrimination ethnique renforce la cohésion nationale.",
        backContent: "Faux. La discrimination divise la société et fragilise l'unité nationale. La loi punit le racisme et le tribalisme.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 10,
      },
    ],
  },
  {
    lesson: {
      title: "L'Environnement et le Développement Durable",
      description: "Protection de la nature et gestion responsable des ressources",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 5,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le développement durable ?",
        backContent: "C'est un développement qui répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Pourquoi faut-il protéger la forêt ivoirienne ?",
        backContent: "Pour préserver la biodiversité, lutter contre le changement climatique (stockage de carbone), réguler le cycle de l'eau et assurer des ressources pour l'avenir.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Citez un geste éco-citoyen quotidien.",
        backContent: "Ne pas jeter d'ordures dans la rue, économiser l'eau, éteindre les lumières inutiles, planter des arbres.",
        cardType: "basic",
        displayOrder: 3,
        points: 10,
      },
    ],
  },
];

// ============================================================================
// ECM / EDHC TERMINALE (BAC)
// ============================================================================

const bacECMLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "L'État et la Nation",
      description: "Concepts approfondis de souveraineté, nation et État de droit",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 6,
    },
    cards: [
      {
        frontContent: "Quelle est la différence entre État et Nation ?",
        backContent: "L'État est une organisation politique et juridique souveraine sur un territoire. La Nation est une communauté humaine unie par une histoire, une culture et une volonté de vivre ensemble.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Qu'est-ce que la souveraineté nationale ?",
        backContent: "C'est le principe selon lequel l'autorité suprême appartient au peuple, qui l'exerce directement ou par ses représentants.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce qu'un État de droit ?",
        backContent: "Un système institutionnel dans lequel la puissance publique est soumise au droit. Chacun, y compris l'État, doit respecter la loi.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Les Relations Internationales et la Mondialisation",
      description: "Coopération internationale, ONU, et place de l'Afrique dans le monde",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 7,
    },
    cards: [
      {
        frontContent: "Quels sont les objectifs principaux de l'ONU ?",
        backContent: "Maintenir la paix et la sécurité internationales, développer des relations amicales entre les nations, réaliser la coopération internationale et être un centre d'harmonisation.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Qu'est-ce que la CEDEAO ?",
        backContent: "La Communauté Économique des États de l'Afrique de l'Ouest. Une organisation régionale visant l'intégration économique et la coopération politique.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Définissez la mondialisation.",
        backContent: "Processus d'intensification des échanges (économiques, culturels, politiques) à l'échelle planétaire, créant une interdépendance croissante entre les pays.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Vrai ou Faux : Le droit de veto au Conseil de sécurité de l'ONU est détenu par tous les pays membres.",
        backContent: "Faux. Seuls les 5 membres permanents (USA, Russie, Chine, France, Royaume-Uni) disposent du droit de veto.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Droits de l'Homme et Démocratie en Afrique",
      description: "Défis et progrès de la démocratie et des droits humains sur le continent",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 8,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que la Charte Africaine des Droits de l'Homme et des Peuples ?",
        backContent: "Un instrument international de l'Union Africaine destiné à promouvoir et protéger les droits de l'homme et les libertés fondamentales en Afrique.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Citez deux obstacles à la démocratie en Afrique.",
        backContent: "Les coups d'État, la corruption, la fraude électorale, le tribalisme politique, la pauvreté.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que la société civile ?",
        backContent: "L'ensemble des organisations non gouvernementales et des associations qui agissent dans l'intérêt public et servent de contre-pouvoir ou de partenaire à l'État.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
    ],
  },
];

export async function seedECMComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive ECM/EDHC seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    // ECM usually uses the abbreviation "ECM" or "EDHC". Let's check for ECM first.
    let ecmSubjectId = subjectsMap.get("ECM");
    if (!ecmSubjectId) {
      // Fallback or create if not exists? Ideally it should exist from seed.ts
      // If not found, we might skip or throw. Let's assume it exists as per seed.ts
      // Wait, seed.ts has "ECM" - "Éducation Civique et Morale"
      throw new Error("ECM subject not found");
    }

    // Combine all ECM lessons
    const allECMLessons = [
      ...bepcECMLessons,
      ...bacECMLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing ECM/EDHC lessons...");

    for (const { lesson, cards: cardsData } of allECMLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: ecmSubjectId,
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

    console.log("\n🎉 ECM/EDHC comprehensive seeding completed!");
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
    console.error("❌ Error seeding comprehensive ECM/EDHC:", error);
    throw error;
  }
}

if (require.main === module) {
  seedECMComprehensive()
    .then(() => {
      console.log("✨ Comprehensive ECM/EDHC seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Comprehensive ECM/EDHC seeding failed:", error);
      process.exit(1);
    });
}
