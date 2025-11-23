/**
 * Comprehensive History and Geography Seeding Script for Ivorian BEPC/BAC
 * Complete collection of History and Geography lessons and flashcards
 * Focused on Côte d'Ivoire and African context
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

import { initDatabase } from "../database/setup";
import { lessons, cards, subjects } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// ============================================================================
// HISTOIRE-GÉOGRAPHIE BEPC (3ème) - 20 Leçons
// ============================================================================

// MODULE 1: HISTOIRE DE L'AFRIQUE PRÉ-COLONIALE (5 Leçons)
const historyPreColonialLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Grands Empires d'Afrique de l'Ouest",
      description: "Empires du Mali, Songhaï et Ghana avec leur impact sur la Côte d'Ivoire actuelle",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Quelle était la principale richesse de l'Empire du Mali?",
        backContent: "L'or, extrait des mines de Boure et Bambouk, et contrôlé grâce aux routes commerciales transsahariennes reliant le Soudan à l'Afrique du Nord.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qui était Mansa Moussa et pourquoi son pèlerinage à la Mecque est-il célèbre?",
        backContent: "Empereur du Mali (1312-1337), plus riche homme de l'histoire. Son pèlerinage en 1324 avec 60 000 personnes et tonnes d'or a révélé la richesse du Mali au monde islamique.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Comment l'Empire du Mali a-t-il influencé les régions actuelles de la Côte d'Ivoire?",
        backContent: "Par les réseaux commerciaux (or, sel, esclaves), diffusion de l'islam, échanges culturels avec les peuples mandingues du nord de la Côte d'Ivoire (actuelle région d'Odienné).",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux: L'Empire du Songhaï a été détruit par les Portugais",
        backContent: "Faux. L'Empire du Songhaï a été détruit par les Marocains en 1591 à la bataille de Tondibi, marquant la fin des grands empires soudanais.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Royaumes de la Région de Côte d'Ivoire",
      description: "Royaumes Kong, Gyaaman et autres formations politiques précoloniales",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Quel était le royaume le plus puissant du nord de l'actuelle Côte d'Ivoire?",
        backContent: "L'Empire de Kong (1710-1895), fondé par Sekou Wattara, contrôlant un vaste territoire entre la Côte d'Ivoire, le Burkina Faso et le Mali actuels.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qui était la reine Pokou et pourquoi est-elle importante dans l'histoire ivoirienne?",
        backContent: "Reine fondatrice du peuple Baoulé au XVIIIe siècle. Mena son peuple du Ghana vers la Côte d'Ivoire après des conflits. Légende du sacrifice de son fils pour traverser la rivière Comoé.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Comment s'organisait le commerce précolonial dans la région de Côte d'Ivoire?",
        backContent: "Réseau commercial nord-sud: sel, bétail, tissus du nord; kola, ivoire, or du sud. Commerce avec les peuples de la forêt et les réseaux transsahariens.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Quelle était la structure sociale typique des royaumes ivoiriens précoloniaux?",
        backContent: "Société hiérarchisée: roi (chef suprême), noblesse guerrière, commerçants, artisans, agriculteurs libres, esclaves. pouvoir souvent basé sur l'âge et les alliances.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Sociétés et Cultures Précoloniales",
      description: "Organisation sociale et richesse culturelle des peuples de Côte d'Ivoire",
      difficulty: "easy",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Quelles sont les principaux groupes ethniques de Côte d'Ivoire et leurs régions?",
        backContent: "Akan (42%, sud et centre), Sénoufo (15%, nord), Malinké (11%, nord-ouest), Bété (10%, centre-ouest), Krou (11%, sud-ouest), autres (11%).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quel rôle jouaient les masques dans les sociétés traditionnelles ivoiriennes?",
        backContent: "Rôle religieux (communication avec esprits), social (initiations, funérailles), politique (pouvoir du chef), artistique. Chaque ethnie avait ses propres styles et significations.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Comment s'exprimait la tradition orale dans les cultures ivoiriennes?",
        backContent: "À travers griots (historiens), contes, proverbes, épopées, chants. Transmission de l'histoire, des valeurs, des lois et du savoir générationnel.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
    ],
  },
];

// MODULE 2: PÉRIODE COLONIALE (4 Leçons)
const historyColonialLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "L'Arrivée des Européens en Côte d'Ivoire",
      description: "Premiers contacts portugais et implantation progressive",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 4,
    },
    cards: [
      {
        frontContent: "Quand les Portugais ont-ils atteint pour la première fois la côte ivoirienne?",
        backContent: "Dans les années 1470, avec l'arrivée de explorateurs comme Soeiro da Costa qui a donné le nom à la côte (Costa do Marfim - Côte de l'Ivoire).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Pourquoi la Côte d'Ivoire portait-elle ce nom à l'origine?",
        backContent: "À cause de l'abondance d'éléphants dans la région au XVe siècle. Le commerce d'ivoire était l'une des principales activités avec les Européens.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Quels étaient les premiers comptoirs commerciaux établis?",
        backContent: "Assinie (1637), Grand-Bassam (1670), Jacqueville. Utilisés pour le commerce d'ivoire, d'or, d'esclaves avec les populations locales.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Comment les populations locales ont-elles réagi aux premiers contacts européens?",
        backContent: "Résistances locales, accueil commercial pragmatique, échanges culturels. Certains chefs locaux ont profité du commerce pour renforcer leur pouvoir.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "La Conquête Coloniale Française",
      description: "Pacification et établissement de l'administration coloniale",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 5,
    },
    cards: [
      {
        frontContent: "Qui était Louis-Gustave Binger et quel était son rôle?",
        backContent: "Explorateur et premier administrateur colonial français (1887-1893). Signataire de traités avec les chefs locaux, a exploré l'intérieur du pays et établi les bases de la colonisation.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Qu'était la politique de 'pacification' menée par le gouverneur Angoulvant?",
        backContent: "Politique de soumission militaire forcée des populations résistantes (1908-1915). Construction de routes, impôts obligatoires, travail forcé. Très violente et controversée.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Comment Samori Touré a-t-il résisté à la colonisation française?",
        backContent: "A fondé l'Empire Ouassoulou (1878-1898), a mené une guérilla efficace contre les Français pendant 16 ans avant d'être capturé et exilé en 1898.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Quand la Côte d'Ivoire est-elle devenue officiellement colonie française?",
        backContent: "Le 10 mars 1893, par décret, avec Binger comme premier gouverneur. Intégrée à l'Afrique Occidentale Française (AOF) en 1904.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
];

// MODULE 3: GÉOGRAPHIE PHYSIQUE (5 Leçons)
const geographyPhysicalLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Relief et Climat de la Côte d'Ivoire",
      description: "Caractéristiques géographiques et climatiques du territoire ivoirien",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Quelles sont les principales zones climatiques de Côte d'Ivoire?",
        backContent: "Zone côtière (équatorial, humide), zone de transition (tropical humide), zone soudanienne (nord, tropical sec avec saison sèche marquée).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quel est le point culminant de Côte d'Ivoire?",
        backContent: "Le mont Nimba (1752m), à la frontière avec la Guinée et le Liberia. Site du patrimoine mondial de l'UNESCO.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que le climat ivoirien et quelles sont ses caractéristiques?",
        backContent: "Climat tropical avec deux saisons: saison des pluies (mai-juillet et octobre-novembre) et saison sèche (décembre-avril et août-septembre). Températures élevées (25-32°C).",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Vrai ou Faux: La Côte d'Ivoire a un climat désertique dans le nord",
        backContent: "Faux. Le nord a un climat soudanien avec saison sèche longue mais pas désertique. Précipitations annuelles de 800-1200mm, suffisantes pour l'agriculture.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Hydrographie et Ressources en Eau",
      description: "Réseau hydrographique ivoirien et importance pour le développement",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 11,
    },
    cards: [
      {
        frontContent: "Quels sont les quatre principaux bassins versants de Côte d'Ivoire?",
        backContent: "Bassin du Bandama (plus grand), bassin du Comoé (est), bassin du Sassandra (ouest), bassin du Cavally (frontière Liberia).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quel rôle jouent les lagunes dans l'économie côtière ivoirienne?",
        backContent: "Habitats pour pêche artisanale, transport local, tourisme, protection contre l'érosion côtière. Lagune Ébrié très importante pour Abidjan.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Pourquoi la gestion de l'eau est-elle cruciale pour le développement de la Côte d'Ivoire?",
        backContent: "Pour agriculture (cacao, café), hydroélectricité (barrages), eau potable, industrie, transport. Ressource limitée et inégalement répartie.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
];

// MODULE 4: GÉOGRAPHIE HUMAINE ET ÉCONOMIQUE (6 Leçons)
const geographyHumanLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Population et Urbanisation",
      description: "Démographie ivoirienne et développement des villes",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "Quelle est la population actuelle de la Côte d'Ivoire?",
        backContent: "Environ 28 millions d'habitants (2024). Croissance annuelle de 2,6%. Population jeune: 60% a moins de 25 ans.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quelles sont les principales villes de Côte d'Ivoire et leurs rôles?",
        backContent: "Abidjan: capitale économique, port principal. Yamoussoukro: capitale politique. Bouaké: métropole du centre. San Pedro: port cacao. Korhogo: capitale du nord.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Pourquoi l'urbanisation est-elle si rapide en Côte d'Ivoire?",
        backContent: "Exode rural pour opportunités économiques, industrialisation, services éducatifs et de santé, conflits politiques dans certaines régions. Création de bidonvilles.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Quels défis pose la croissance urbaine rapide?",
        backContent: "Équipements insuffisants (eau, électricité), transport, logement, emploi, environnement (pollution), santé publique, sécurité.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Économie Ivoirienne: Secteur Primaire",
      description: "Agriculture et ressources naturelles, fondement de l'économie",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 16,
    },
    cards: [
      {
        frontContent: "Pourquoi la Côte d'Ivoire est-elle le premier producteur mondial de cacao?",
        backContent: "Conditions climatiques favorables, sols adaptés, expérience paysanne, organisation des filières, soutien des coopératives. Production: 40% de la production mondiale.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quels autres produits agricoles sont importants pour l'économie ivoirienne?",
        backContent: "Café (robusta), caoutchouc, huile de palme, coton, ananas, bananes, hévéa, riz. Diversification nécessaire pour réduire dépendance au cacao.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Quels défis rencontre le secteur agricole ivoirien?",
        backContent: "Déforestation, vieillissement des plantations, changement climatique, fluctuation des prix mondiaux, insécurité foncière, manque d'investissement.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Quelle est l'importance de l'exploitation forestière?",
        backContent: "Historiquement importante (bois d'œuvre), mais aujourd'hui limitée par la déforestation. Reboisement et exploitation durable sont des priorités.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
];

export async function seedHistoryGeographyComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive History-Geography seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const hgSubjectId = subjectsMap.get("HG");
    if (!hgSubjectId) {
      throw new Error("History-Geography subject not found");
    }

    // Combine all History-Geography lessons
    const allHGLessons = [
      ...historyPreColonialLessons,
      ...historyColonialLessons,
      ...geographyPhysicalLessons,
      ...geographyHumanLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing History-Geography lessons...");

    for (const { lesson, cards: cardsData } of allHGLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: hgSubjectId,
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

    console.log("\n🎉 History-Geography comprehensive seeding completed!");
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
    console.error("❌ Error seeding comprehensive History-Geography:", error);
    throw error;
  }
}

if (require.main === module) {
  seedHistoryGeographyComprehensive()
    .then(() => {
      console.log("✨ Comprehensive History-Geography seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Comprehensive History-Geography seeding failed:", error);
      process.exit(1);
    });
}
