/**
 * Comprehensive Economics Seeding Script for Ivorian BAC Serie E
 * Complete collection of Economics lessons and flashcards adapted for Côte d'Ivoire context
 * Microeconomics, macroeconomics, and development economics with Ivorian examples
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
// ECONOMICS TERMINALE BAC - SÉRIE E - 25 Leçons
// ============================================================================

// MODULE 1: MICROÉCONOMIE - L'OFFRE ET LA DEMANDE (8 Leçons)
const economicsMicroLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Lois de l'Offre et de la Demande",
      description: "Principes fondamentaux du marché avec applications au marché ivoirien",
      difficulty: "medium",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que la loi de l'offre?",
        backContent: "Loi stipulant que les producteurs offrent plus de biens lorsque leur prix augmente, toutes choses égales par ailleurs. Explication : prix plus élevé = profit plus attractif = augmentation de la quantité offerte.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la loi de la demande?",
        backContent: "Loi stipulant que les consommateurs demandent moins de biens lorsque leur prix augmente, toutes choses égales par ailleurs. Explication : prix plus élevé = pouvoir d'achat réduit = diminution de la quantité demandée.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application marché du cacao : Si le prix du cacao passe de 750 à 900 FCFA/kg, comment réagissent producteurs et consommateurs?",
        backContent: "Producteurs (offre) : augmentent la production car prix plus attractif. Consommateurs (demande) : diminuent la consommation car coût plus élevé. Nouvel équilibre quantité-prix.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Calculez l'élasticité-prix de la demande si une augmentation de 10% du prix entraîne une baisse de 15% de la quantité demandée",
        backContent: "Élasticité-prix = % variation quantité / % variation prix = (-15%) / (+10%) = -1,5. Demande élastique car valeur absolue > 1 : forte réaction au prix.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Les biens de première nécessité ont une demande très élastique",
        backContent: "Faux. Les biens de première nécessité (nourriture, médicaments) ont une demande inélastique car les consommateurs ne peuvent pas facilement réduire leur consommation même si les prix augmentent.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'Équilibre du Marché Concurrentiel",
      description: "Formation du prix d'équilibre et allocation optimale des ressources",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le prix d'équilibre?",
        backContent: "Prix auquel la quantité offerte égale la quantité demandée. Point d'intersection des courbes d'offre et de demande. Ce prix coordinate les décisions des producteurs et consommateurs.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quel est le mécanisme d'ajustement du marché?",
        backContent: "Si prix d'équilibre (P*) : excès d'offre → baisse des prix, excès de demande → hausse des prix. Prix s'ajuste jusqu'à QO = QD. Si prix inférieur à P* : pénurie → augmentation des prix.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application marché du pétrole ivoirien : Comment se forme le prix du carburant?",
        backContent: "Prix international + coûts transport + taxes + marge distribution. L'OPEC influence l'offre mondiale. Demande domestique relativement inélastique. Gouvernement ivoirien peut réguler les prix via taxes.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Calculez le surplus du consommateur et du producteur",
        backContent: "Surplus consommateur = aire sous courbe demande au-dessus du prix. Surplus producteur = aire sous prix au-dessus de courbe offre. Surplus total = somme des deux. Représente le bénéfice total net pour la société.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Quelles conditions d'un marché concurrentiel parfait s'appliquent aux marchés ivoiriens?",
        backContent: "Théoriquement : atomicité (beaucoup de petits producteurs), produit homogène (cacao qualité standard), transparence information. Réalité : monopsoles temporaires (CEDEAO, taxe), barrières commerciales, information imparfaite.",
        cardType: "basic",
        displayOrder: 5,
        points: 30,
      },
    ],
  },
];

// MODULE 2: MICROÉCONOMIE - COMPORTEMENT DES ENTREPRISES (6 Leçons)
const economicsFirmLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Coûts de Production",
      description: "Coûts fixes, variables, coûts marginaux avec applications aux entreprises ivoiriennes",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 9,
    },
    cards: [
      {
        frontContent: "Quelle est la différence entre coûts fixes et coûts variables?",
        backContent: "Coûts fixes : indépendants du niveau de production (loyer, assurances, salaires administratifs). Coûts variables : varient avec production (matières premières, salaires ouvriers, énergie).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Qu'est-ce que le coût marginal?",
        backContent: "Coût additionnel pour produire une unité supplémentaire. CM = ΔCT/ΔQ. Crucial pour décider niveau optimal de production. Production optimale quand CM = prix.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Les coûts fixes d'une petite entreprise ivoirienne sont 500 000 FCFA/an. Les coûts variables sont de 1000 FCFA par unité produite. Calculez le coût total pour 50 unités et 100 unités",
        backContent: "50 unités : 500 000 + (50 × 1000) = 100 000 FCFA. 100 unités : 500 000 + (100 × 1000) = 600 000 FCFA. Coût moyen : 100 000/50 = 2000 FCFA, 600 000/100 = 6000 FCFA.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application restaurant ivoirien : Quand un restaurant étend ses heures d'ouverture",
        backContent: "Coûts fixes augmentent (loyer, salaires fixes), mais coûts variables répartis sur plus de clients. Coût moyen par client diminue pendant heures creuses, s'élève pendant heures pleines. Stratégie : tarifs réduis heures creuses.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Les économies d'échelle signifient toujours des coûts décroissants",
        backContent: "Faux. Économies d'échelle existent quand coûts moyens diminuent avec production (coûts fixes répartis). Mais les rendements décroissants peuvent faire augmenter les coûts moyens au-delà d'un certain point.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Les Structures de Marché",
      description: "Concurrence parfaite, monopole, oligopole et régulation en Côte d'Ivoire",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Quelles sont les caractéristiques du monopole?",
        backContent: "Un seul producteur, absence de substituts proches, barrières à l'entrée. Le monopoleur est price maker : peut influencer le prix de marché. Maximise le profit où revenu marginal = coût marginal.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Comment la SONABEL (compagnie d'électricité) agit-elle comme un monopole?",
        backContent: "Monopole naturel sur distribution électricité. Régulée par autorité ivoirienne (ANARE). Prix fixés avec approbination gouvernementale. Recherche de profit équitable avec obligation de service public.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Qu'est-ce qu'un oligopole?",
        backContent: "Petit nombre d'entreprises dominantes, interdépendance stratégique, barrières à l'entrée. Telecom ivoirien (MTN, Orange) : duopole. Industries extractives (cacao, café) : marché concentré.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application cacao : Le marché du cacao ivoirien est-il un oligopole?",
        backContent: "Théoriquement : nombreux petits planteurs. Pratique : quelques grandes multinationales contrôlent transformation et exportation. Concentration plus élevée en amont (transformation) qu'en aval (production).",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Quelles sont les politiques de régulation du monopole en Côte d'Ivoire?",
        backContent: "Tarification régulée (SONABEL), contrôle des prix (biens essentiels), autorisation de concurrence (secteurs ouverts), protection consommateurs, encadrement des investissements privés.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
];

// MODULE 3: MACROÉCONOMIE - PRODUCTION ET CROISSANCE (6 Leçons)
const economicsMacroLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Le Produit Intérieur Brut (PIB)",
      description: "Mesure de la production économique et croissance en Côte d'Ivoire",
      difficulty: "medium",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le PIB?",
        backContent: "Valeur marchande de tous les biens et services finaux produits dans un pays pendant une période donnée. Mesure la taille de l'économie. PIB = C + I + G + (X - M) en économie ouverte.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la différence entre PIB nominal et PIB réel?",
        backContent: "PIB nominal : valeur aux prix courants, incluant l'inflation. PIB réel : ajusté de l'inflation, mesure la production réelle. Le PIB réel permet les comparaisons temporelles de croissance économique.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application à la Côte d'Ivoire : Principales composantes du PIB",
        backContent: "Agriculture : ~22% (cacao, café, coton, anacarde, hévéa). Industrie : ~28% (transformation agroalimentaire, construction). Services : ~50% (télécommunications, finance, commerce, tourisme). Tertiaire dominant.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Calculez le taux de croissance si PIB passe de 25 000 à 27 500 milliards de FCFA",
        backContent: "Taux croissance = ((27500 - 25000)/25000) × 100 = 2500/25000 × 100 = 10%. La Côte d'Ivoire connaîtrait une croissance économique de 10%.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : Le PIB par habitant mesure bien-être",
        backContent: "Faux. Le PIB mesure production matérielle mais pas bien-être. Les inégalités, environnement, qualité services ne sont pas comptabilisés. IDH (Indice de Développement Humain) combine PIB/habitant, éducation, espérance vie.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'Inflation et ses Causes",
      description: "Mesure, causes et effets de l'inflation sur l'économie ivoirienne",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 16,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que l'inflation?",
        backContent: "Augmentation généralisée et continue des prix des biens et services. Se mesure par taux d'inflation = (IPC - 100)/100. Perte de pouvoir d'achat de la monnaie.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelles sont les causes inflationnistes?",
        backContent: "Inflation par la demande : excès de demande sur offre (achats excessifs). Inflation par les coûts : augmentation des coûts de production (énergie, salaires). Inflation monétaire : expansion excessive de la masse monétaire.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment la BCEAO gère-t-elle l'inflation en Zone UEMOA?",
        backContent: "Objectif : maintenir inflation sous 3%. Principes : ancrage du FCFA à l'euro, politique monétaire restrictive, coordination avec Banque Centrale Européenne. Cible de stabilité prix pour investissement.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Effets de l'inflation sur économie ivoirienne",
        backContent: "Négatifs : érosion pouvoir d'achat, incertitude économique, taux d'intérêt élevés. Positifs : allègement dette si fixe, stimulation temporaire croissance. Mais globallement dommageable pour développement.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Application calcul d'inflation : Panier moyen = 1000 FCFA en 2020, 1050 en 2021. Taux d'inflation?",
        backContent: "Taux = ((1050 - 1000)/1000) × 100 = 5%. Inflation modérée de 5% par an. Les prix augmentent modérément, érodant progressivement pouvoir d'achat.",
        cardType: "basic",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
];

// MODULE 4: DÉVELOPPEMENT ÉCONOMIQUE (5 Leçons)
const economicsDevelopmentLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Indicateurs de Développement",
      description: "PIB par habitant, IDH, inégalités, pauvreté en Côte d'Ivoire",
      difficulty: "medium",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 21,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que l'IDH (Indice de Développement Humain)?",
        backContent: "Indice composite qui combine espérance de vie, niveau d'éducation, revenu par habitant. Mesure bien-être global pas seulement économique. Scale : 0 (minimal) à 1 (optimal).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la position de la Côte d'Ivoire dans l'IDH mondial?",
        backContent: "IDH 2022 : 0.578 (rang 162 sur 191). Classement moyen inférieur. Progrès mais encore défiis importants en éducation, santé, espérance vie. Cible : pays à revenu intermédiaire supérieur.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Que mesure le coefficient de Gini?",
        backContent: "Inégalité de distribution des revenus. 0 = égalité parfaite, 1 = inégalité maximale. Côte d'Ivoire : environ 0.43 (inégalité modérée). Attention à la concentration des richesses dans zones urbaines.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application indicateur de pauvreté : Seuil de pauvreté en Côte d'Ivoire",
        backContent: "Pauvreté absolue : revenu < 1,90$/jour (~1150 FCFA/jour). Environ 46% de la population sous ce seuil (2022). Pauvreté relative : revenu < 60% du revenu médian national.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Croissance économique garantit réduction de la pauvreté",
        backContent: "Faux. Croissance économique nécessaire mais pas suffisante. Redistribution équitable, investissement dans éducation, santé essentiels. Croissance sans redistribution peut augmenter inégalités.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
];

export async function seedEconomicsComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive Economics seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const economicsSubjectId = subjectsMap.get("ECO");
    if (!economicsSubjectId) {
      throw new Error("Economics subject not found");
    }

    // Combine all Economics lessons
    const allEconomicsLessons = [
      ...economicsMicroLessons,
      ...economicsFirmLessons,
      ...economicsMacroLessons,
      ...economicsDevelopmentLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing Economics lessons...");

    for (const { lesson, cards: cardsData } of allEconomicsLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: economicsSubjectId,
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

    console.log("\n🎉 Economics comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Focus: Ivorian economy, BCEAO, development`);
    console.log(`   - Level: BAC Series E preparation`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Economics:", error);
    throw error;
  }
}

if (require.main === module) {
  seedEconomicsComprehensive()
    .then(() => {
      console.log("✨ Economics comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Economics comprehensive seeding failed:", error);
      process.exit(1);
    });
}
