/**
 * Comprehensive SVT (Sciences de la Vie et de la Terre) Seeding Script
 * Complete collection of SVT lessons and flashcards for Ivorian BEPC/BAC
 * Adapted for Côte d'Ivoire educational system with local context
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
// SVT BEPC (3ème) - 25 Leçons
// ============================================================================

// MODULE 1: BIOLOGIE CELLULAIRE ET GÉNÉTIQUE (6 Leçons)
const svtCellularLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Cellule: Unité Fondamentale du Vivant",
      description: "Structure et fonction des cellules animales et végétales avec exemples ivoiriens",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Quelle est la différence principale entre une cellule animale et une cellule végétale?",
        backContent: "La cellule végétale possède une paroi cellulosique rigide, des chloroplastes pour la photosynthèse et une grande vacuole centrale, que la cellule animale n'a pas.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quel est le rôle de la mitochondrie dans la cellule?",
        backContent: "La mitochondrie est la centrale énergétique de la cellule. Elle produit l'ATP (énergie) par respiration cellulaire à partir du glucose et de l'oxygène.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Pourquoi les cellules des plantes tropicales ivoiriennes sont-elles particulièrement adaptées à la photosynthèse?",
        backContent: "Elles contiennent de nombreux chloroplastes riches en chlorophylle pour capter l'intense lumière solaire. De plus, leur structure leur permet de résister à la forte chaleur et humidité tropicale.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux: Toutes les cellules ont un noyau",
        backContent: "Faux. Les cellules procaryotes (bactéries) n'ont pas de noyau, leur matériel génétique flotte dans le cytoplasme. Seules les cellules eucaryotes ont un noyau.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "La Membrane Cellulaire et les Échanges",
      description: "Structure de la membrane cellulaire et mécanismes de transport",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que l'osmose?",
        backContent: "L'osmose est le passage de l'eau à travers une membrane semi-perméable d'une zone de faible concentration en solutés vers une zone de forte concentration.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Comment les racines des plantes de cacao en Côte d'Ivoire absorbent-elles l'eau et les nutriments?",
        backContent: "Par osmose à travers les poils absorbants. La membrane cellulaire laisse passer l'eau et les ions minéraux nécessaires mais retient les grosses molécules. C'est essentiel pour la production de cacao de qualité.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Quelle est la différence entre diffusion passive et transport actif?",
        backContent: "La diffusion passive se fait sans énergie (du gradient de concentration au gradient inverse). Le transport actif nécessite de l'énergie (ATP) et va contre le gradient de concentration.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "La Génétique et l'Hérédité selon Mendel",
      description: "Lois de Mendel avec applications aux caractères héréditaires en Afrique de l'Ouest",
      difficulty: "hard",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Énoncez la première loi de Mendel",
        backContent: "Loi de ségrégation: Les deux allèles d'un gène se séparent lors de la formation des gamètes, chaque gamète ne recevant qu'un seul allèle.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que la drépanocytose et pourquoi est-elle fréquente en Afrique de l'Ouest?",
        backContent: "C'est une maladie génétique du sang due à une mutation du gène de l'hémoglobine. Elle est fréquente car l'allèle drépanocytaire procure une protection partielle contre le paludisme, avantage évolutif en zone paludéenne.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Un couple hétérozygote pour les yeux bruns (B dominant, b récessif) peut avoir des enfants aux yeux bleus. Calculez la probabilité.",
        backContent: "Parents: Bb × Bb. Échiquier de croisement: BB (25%), Bb (50%), Bb (50%), bb (25%). Probabilité yeux bleus = 25%.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Pourquoi la variabilité génétique est-elle importante pour l'agriculture ivoirienne?",
        backContent: "Elle permet de développer des variétés résistantes aux maladies (comme la pourriture brune du cacao), adaptées au changement climatique, et avec de meilleurs rendements pour assurer la sécurité alimentaire.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'ADN et la Synthèse des Protéines",
      description: "Structure de l'ADN et mécanisme de synthèse des protéines",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 4,
    },
    cards: [
      {
        frontContent: "Quelle est la structure en double hélice de l'ADN?",
        backContent: "Deux chaînes de nucléotides antiparallèles reliées par des liaisons hydrogène entre les bases complémentaires (A-T et G-C), s'enroulant autour d'un axe central.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Comment un gène est-il transformé en protéine?",
        backContent: "Transcription: ADN → ARN messager dans le noyau. Traduction: ARNm → protéine dans les ribosomes du cytoplasme avec les ARNt et ARNr.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Quel est l'intérêt des OGM pour l'agriculture ivoirienne?",
        backContent: "Développer des plants de cacao résistants aux maladies, de manioc plus nutritif, ou de riz tolérant à la sécheresse. Mais soulève des questions de biodiversité et d'autonomie alimentaire.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "La Mitose et la Méiose",
      description: "Division cellulaire et reproduction sexuée",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 5,
    },
    cards: [
      {
        frontContent: "Quelle est la différence fondamentale entre mitose et méiose?",
        backContent: "La mitose produit 2 cellules identiques à la mère (2n) pour croissance et réparation. La méiose produit 4 gamètes différents (n) pour reproduction sexuée.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Pourquoi la méiose est-elle essentielle pour la reproduction des espèces animales d'élevage en Côte d'Ivoire?",
        backContent: "Elle crée de la diversité génétique nécessaire pour améliorer les races (volailles, poissons d'élevage), résister aux maladies locales et s'adapter aux conditions environnementales changeantes.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Quand se produit la méiose chez les humains?",
        backContent: "Chez les hommes: de la puberté jusqu'à la fin de vie (production continue de spermatozoïdes). Chez les femmes: à la naissance (ovocytes primordiaux) avec un cycle mensuel jusqu'à la ménopause.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Les Mutations Génétiques et leurs Conséquences",
      description: "Types de mutations et impact sur les organismes",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 6,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une mutation génétique?",
        backContent: "Un changement permanent dans la séquence d'ADN, qui peut être spontané ou provoqué par des agents mutagènes (rayons UV, produits chimiques).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Pourquoi l'utilisation abusive de pesticides dans les plantations ivoiriennes peut-elle provoquer des mutations?",
        backContent: "Certains pesticides contiennent des composés mutagènes qui peuvent endommager l'ADN des cellules, augmentant le risque de cancers et de mutations héréditaires chez l'homme et les animaux.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Toutes les mutations sont-elles néfastes? Justifiez avec un exemple.",
        backContent: "Non. Certaines mutations peuvent être bénéfiques ou neutres. Exemple: mutation conférant résistance au paludisme, ou mutation améliorant la production de cacao dans certaines variétés.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
    ],
  },
];

// MODULE 2: ANATOMIE ET PHYSIOLOGIE HUMAINE (5 Leçons)
const svtHumanLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "L'Appareil Digestif Humain",
      description: "Structure et fonctionnement du système digestif avec alimentation ivoirienne",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 7,
    },
    cards: [
      {
        frontContent: "Décrivez le trajet alimentaire dans l'appareil digestif",
        backContent: "Bouche → Pharynx → Œsophage → Estomac → Intestin grêle → Gros intestin → Rectum → Anus. Durée totale: 24-72h.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quel est le rôle de la vésicule biliaire dans la digestion?",
        backContent: "Elle stocke et concentre la bile produite par le foie, puis la libère dans l'intestin pour émulsifier les graisses et faciliter leur digestion.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Comment l'alloco (plat ivoirien à base de poisson fumé et banane plantain) est-il digéré?",
        backContent: "Proteines du poisson: enzymes protéases dans estomac et intestin. Amidon de banane: amylases salivaire et pancréatique. Graisses: sels biliaires et lipases. Fibres: non digestibles mais utiles pour le transit.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi est-il recommandé de manger lentement?",
        backContent: "Pour permettre une bonne mastication (action mécanique), une salivation adéquate (amylase commence la digestion), et laisser le temps au cerveau de recevoir les signaux de satiété (20 minutes).",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "La Respiration et l'Appareil Circulatoire",
      description: "Mécanismes respiratoires et circulation sanguine avec adaptation au climat ivoirien",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 8,
    },
    cards: [
      {
        frontContent: "Quelles sont les étapes de la respiration pulmonaire?",
        backContent: "1) Ventilation pulmonaire (entrée/sortie d'air). 2) Diffusion gazeuse alvéolo-capillaire (O₂ dans sang, CO₂ hors sang). 3) Transport des gaz dans le sang. 4) Diffusion au niveau tissulaire.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Comment le corps s'adapte-t-il à la chaleur et l'humidité de Côte d'Ivoire?",
        backContent: "Transpiration abondante pour refroidissement, augmentation du débit sanguin cutané, modification de la fréquence respiratoire, adaptation du métabolisme basal.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Pourquoi les maladies respiratoires comme la tuberculose sont-elles préoccupantes en Côte d'Ivoire?",
        backContent: "Climat chaud et humide favorise survie de bactéries, promiscuité en zones urbaines, systèmes immunitaires affaiblis par malnutrition ou VIH, accès limité aux soins dans certaines régions.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
];

// MODULE 3: ÉCOLOGIE ET ENVIRONNEMENT (6 Leçons)
const svtEcologyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Écosystèmes Forestiers de Côte d'Ivoire",
      description: "La forêt classée de Taï et autres écosystèmes forestiers ivoiriens",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 13,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qui rend la forêt classée de Taï unique au monde?",
        backContent: "C'est l'une des dernières forêts primaires d'Afrique de l'Ouest, avec une biodiversité exceptionnelle: plus de 1300 espèces de plantes, chimpanzés, éléphants de forêt, et nombreuses espèces endémiques.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la structure verticale d'une forêt tropicale ivoirienne?",
        backContent: "1) Canopée (arbres > 30m). 2) Sous-canopée (15-30m). 3) Arbustes (5-15m). 4) Strate herbacée (< 5m). 5) Sol forestier avec litière et racines.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Pourquoi les forêts ivoiriennes sont-elles menacées?",
        backContent: "Déforestation pour agriculture (cacao, hévéas), exploitation forestière illégale, changement climatique, pression démographique, feux de brousse.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Quel rôle jouent les forêts dans la régulation du climat local en Côte d'Ivoire?",
        backContent: "Elles maintiennent l'humidité atmosphérique, créent des microclimats, stockent le CO₂, préviennent l'érosion des sols, et régulent le cycle de l'eau local.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Les Écosystèmes de Savane",
      description: "Parcs nationaux Comoé et autres savanes ivoiriennes",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 14,
    },
    cards: [
      {
        frontContent: "Quelles caractéristiques définissent l'écosystème de savane ivoirien?",
        backContent: "Végétation dominée par les herbes avec arbres dispersés, climat tropical avec saison sèche marquée, sols souvent latéritiques, faune adaptée (éléphants, lions, antilopes).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Comment les animaux de savane s'adaptent-ils à la saison sèche?",
        backContent: "Migration saisonnière, réduction de l'activité, adaptation métabolique, dépendance aux points d'eau permanents, modifications du régime alimentaire.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Pourquoi les feux de brousse sont-ils importants dans les écosystèmes de savane?",
        backContent: "Ils nettoient la végétation morte, stimulent la repousse, maintiennent l'équilibre entre herbes et arbres, recyclent les nutriments. Mais peuvent être destructeurs s'ils sont trop fréquents ou intenses.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
];

// MODULE 4: GÉOLOGIE ET SCIENCES DE LA TERRE (4 Leçons)
const svtGeologyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Géologie du Craton Ouest Africain",
      description: "Formation géologique et ressources minières de Côte d'Ivoire",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 19,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le craton Ouest Africain?",
        backContent: "Une masse continentale stable et très ancienne (>2 milliards d'années) qui forme le fondement géologique de la Côte d'Ivoire et pays voisins, riche en ressources minières.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Quelles sont les principales ressources minières de Côte d'Ivoire?",
        backContent: "Or (mines d'Agboville, Bondoukou), manganèse (Lahou), nickel (Toulépleu), diamants (Séguéla), bauxite, fer. Potentiel pétrolier offshore.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Comment les sols tropicaux ivoiriens se sont-ils formés?",
        backContent: "Altération chimique intense des roches par climat chaud et humide, créant des sols latéritiques riches en fer et aluminium, souvent profonds mais fragiles.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Le Cycle de l'Eau en Côte d'Ivoire",
      description: "Ressources en eau et gestion hydrologique",
      difficulty: "medium",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 20,
    },
    cards: [
      {
        frontContent: "Quels sont les principaux cours d'eau de Côte d'Ivoire?",
        backContent: "Bandama (plus long, 1050km), Comoé, Sassandra, Cavally. Forment 4 bassins versants principaux avec leurs affluents.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Comment le changement climatique affecte-t-il les ressources en eau ivoiriennes?",
        backContent: "Variation des précipitations, augmentation des sécheresses, modification du régime des cours d'eau, baisse des nappes phréatiques, augmentation des besoins en eau.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Quel est le rôle des lagunes côtières dans l'écosystème ivoirien?",
        backContent: "Habitats pour poissons et crustacés, zone de reproduction marine, protection contre l'érosion côtière, filtration naturelle des eaux, activité économique (pêche, tourisme).",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
];

export async function seedSVTComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive SVT seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const svtSubjectId = subjectsMap.get("SVT");
    if (!svtSubjectId) {
      throw new Error("SVT subject not found");
    }

    // Combine all SVT lessons
    const allSVTLessons = [
      ...svtCellularLessons,
      ...svtHumanLessons,
      ...svtEcologyLessons,
      ...svtGeologyLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing SVT lessons...");

    for (const { lesson, cards: cardsData } of allSVTLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: svtSubjectId,
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

    console.log("\n🎉 SVT comprehensive seeding completed!");
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
    console.error("❌ Error seeding comprehensive SVT:", error);
    throw error;
  }
}

if (require.main === module) {
  seedSVTComprehensive()
    .then(() => {
      console.log("✨ Comprehensive SVT seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Comprehensive SVT seeding failed:", error);
      process.exit(1);
    });
}
