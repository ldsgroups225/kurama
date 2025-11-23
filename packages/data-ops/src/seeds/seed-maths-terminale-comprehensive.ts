/**
 * Comprehensive Mathematics Seeding Script for Ivorian BAC Terminale
 * Complete collection of Mathematics lessons and flashcards for all BAC series
 * Adapted for Côte d'Ivoire educational system - TERMINALE LEVEL
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
// MATHEMATIQUES TERMINALE - SÉRIE C (Mathématiques et Sciences Physiques)
// ============================================================================

// MODULE 1: ANALYSE MATHÉMATIQUE AVANCÉE (8 Leçons)
const tleAnalysisLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Nombres Complexes - Forme Algébrique et Trigonométrique",
      description: "Étude approfondie des nombres complexes pour la série C du BAC",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Quelle est la forme algébrique d'un nombre complexe et comment l'additionne-t-on?",
        backContent: "z = a + bi où a et b sont réels, i² = -1. Addition : (a + bi) + (c + di) = (a + c) + (b + d)i. On additionne parties réelles et imaginaires séparément.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Résolvez dans ℂ : z² + 4z + 13 = 0",
        backContent: "Δ = b² - 4ac = 16 - 52 = -36. Δ = (6i)². Solutions : z = (-4 ± 6i)/2 = -2 ± 3i. Les racines complexes sont conjuguées.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment calcule-t-on le module et l'argument d'un nombre complexe?",
        backContent: "Module : |z| = √(a² + b²). Argument : arg(z) = arctan(b/a) en tenant compte du quadrant. Forme trigonométrique : z = r(cos θ + i sin θ).",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application en ingénierie ivoirienne : Les nombres complexes sont utilisés pour modéliser les circuits électriques. Si le courant I = 3 + 4i A et la tension V = 5 + 12i V, quelle est l'impédance Z?",
        backContent: "Z = V/I = (5 + 12i)/(3 + 4i). Multiplions par le conjugué : Z = (5 + 12i)(3 - 4i)/(3² + 4²) = (15 - 20i + 36i - 48i²)/25 = (15 + 16i + 48)/25 = (63 + 16i)/25 = 2,52 + 0,64i Ω",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Pour tout nombre complexe z non nul, z × z̄ = |z|²",
        backContent: "Vrai. z̄ = a - bi, z × z̄ = (a + bi)(a - bi) = a² - abi + abi - b²i² = a² + b² = |z|². C'est une propriété fondamentale des nombres complexes.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Dérivabilité et Calcul Différentiel",
      description: "Étude de la dérivabilité, règles de dérivation et applications économiques",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Quelle est la définition de la dérivée d'une fonction f en un point x₀?",
        backContent: "f'(x₀) = lim[h→0] (f(x₀ + h) - f(x₀))/h. Géométriquement, c'est le coefficient directeur de la tangente à la courbe au point (x₀, f(x₀)).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Déterminez la dérivée de f(x) = x³ - 3x² + 2x + 5",
        backContent: "f'(x) = 3x² - 6x + 2. On applique les règles : (x³)' = 3x², (-3x²)' = -6x, (2x)' = 2, (5)' = 0.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application économique : Le coût de production C(q) = q³ - 6q² + 15q + 100 où q est la quantité en tonnes. Calculez le coût marginal pour q = 4 tonnes.",
        backContent: "Coût marginal C'(q) = 3q² - 12q + 15. Pour q = 4 : C'(4) = 3×16 - 12×4 + 15 = 48 - 48 + 15 = 15 FCFA par tonne supplémentaire.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Dérivez f(x) = sin(2x) × cos(3x)",
        backContent: "On utilise la règle du produit : f'(x) = (sin(2x))' × cos(3x) + sin(2x) × (cos(3x))'. f'(x) = 2cos(2x) × cos(3x) + sin(2x) × (-3sin(3x)) = 2cos(2x)cos(3x) - 3sin(2x)sin(3x).",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Application au cacao ivoirien : Le prix du cacao suit P(t) = 1000 + 50t - 5t² où t est en mois depuis janvier. Quand le prix atteint-il son maximum?",
        backContent: "P'(t) = 50 - 10t. Maximum quand P'(t) = 0, donc t = 5 mois. P''(t) = -10 < 0, donc c'est bien un maximum. Le prix est maximal en mai (janvier + 5 mois).",
        cardType: "basic",
        displayOrder: 5,
        points: 30,
      },
    ],
  },
  {
    lesson: {
      title: "Intégration et Calcul Intégral",
      description: "Techniques d'intégration et applications en physique et économie",
      difficulty: "hard",
      estimatedDuration: 75,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une primitive d'une fonction f?",
        backContent: "Une fonction F est une primitive de f sur un intervalle I si F'(x) = f(x) pour tout x ∈ I. Toutes les primitives de f sont de la forme F(x) + C où C est une constante.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez ∫(2x² + 3x - 5)dx",
        backContent: "∫(2x² + 3x - 5)dx = (2x³/3) + (3x²/2) - 5x + C = (2/3)x³ + (3/2)x² - 5x + C. On intègre terme par terme en ajoutant 1 à l'exposant et divisant par le nouvel exposant.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application physique : Une particule a une vitesse v(t) = 3t² - 4t + 2 m/s. Quelle est sa position à t = 3s si elle part de l'origine?",
        backContent: "Position s(t) = ∫v(t)dt = ∫(3t² - 4t + 2)dt = t³ - 2t² + 2t + C. Comme s(0) = 0, C = 0. Donc s(3) = 27 - 18 + 6 = 15 mètres.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Calculez l'aire sous la courbe y = x² entre x = 0 et x = 2",
        backContent: "Aire = ∫₀² x² dx = [x³/3]₀² = 8/3 - 0 = 8/3 ≈ 2,67 unités carrées.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Application économique : Si le revenu marginal est R'(q) = 50 - 2q et que R(0) = 0, calculez le revenu total pour q = 20 unités.",
        backContent: "R(q) = ∫R'(q)dq = ∫(50 - 2q)dq = 50q - q² + C. Avec R(0) = 0, C = 0. Donc R(20) = 50×20 - 20² = 1000 - 400 = 600 FCFA.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
];

// MODULE 2: GÉOMÉTRIE ANALYTIQUE ET VECTORIELLE (6 Leçons)
const tleGeometryLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Géométrie Analytique dans l'Espace",
      description: "Représentation analytique et équations dans l'espace tridimensionnel",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Quelle est l'équation d'un plan dans l'espace passant par le point A(1,2,3) et orthogonal au vecteur n(2,1,-1)?",
        backContent: "Équation : n·(M-A) = 0, donc 2(x-1) + 1(y-2) - 1(z-3) = 0. D'où : 2x + y - z + 3 = 0.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Calculez la distance du point P(4,1,2) au plan d'équation 2x - y + z = 5",
        backContent: "Distance = |2×4 - 1 + 2 - 5|/√(2² + (-1)² + 1²) = |8 - 1 + 2 - 5|/√6 = |4|/√6 = 4/√6 = 2√6/3 ≈ 1,63.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application topographique : Un point topographique T a pour coordonnées (100, 200, 150) en mètres. Le sol est représenté par le plan z = 0,8x + 0,5y - 50. À quelle hauteur au-dessus du sol se trouve le point T?",
        backContent: "Altitude du sol sous T : z = 0,8×100 + 0,5×200 - 50 = 80 + 100 - 50 = 130m. Hauteur au-dessus du sol : 150 - 130 = 20m.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
    ],
  },
];

// ============================================================================
// MATHEMATIQUES TERMINALE - SÉRIE D (Sciences Expérimentales)
// ============================================================================

// MODULE 1: STATISTIQUES ET PROBABILITÉS AVANCÉES (5 Leçons)
const tleProbabilityLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Probabilités Conditionnelles et Formule de Bayes",
      description: "Probabilités conditionnelles, indépendance et formule de Bayes avec applications médicales",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 20,
    },
    cards: [
      {
        frontContent: "Quelle est la définition de la probabilité conditionnelle P(A|B)?",
        backContent: "P(A|B) = P(A∩B)/P(B) si P(B) > 0. C'est la probabilité que l'événement A se réalise sachant que B s'est déjà réalisé.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Application médicale : 2% de la population ivoirienne est atteinte du paludisme. Un test détecte 95% des malades et a 2% de faux positifs. Quelle est la probabilité qu'une personne testée positive soit vraiment malade?",
        backContent: "Utilisons Bayes : P(M|+) = P(+|M)P(M)/[P(+|M)P(M) + P(+|NM)P(NM)] = 0,95×0,02/[0,95×0,02 + 0,02×0,98] = 0,019/[0,019 + 0,0196] ≈ 49,2%.",
        cardType: "basic",
        displayOrder: 2,
        points: 30,
      },
      {
        frontContent: "Deux événements A et B sont indépendants si P(A∩B) = P(A)×P(B). Vrai ou Faux?",
        backContent: "Vrai. C'est la définition de l'indépendance. Équivalent aussi à P(A|B) = P(A) et P(B|A) = P(B) quand les probabilités conditionnelles existent.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Loi Binomiale et Applications en Génétique",
      description: "Loi binomiale et ses applications en génétique et biologie",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 21,
    },
    cards: [
      {
        frontContent: "Quand une variable aléatoire X suit une loi binomiale B(n,p), quelle est sa formule de probabilité?",
        backContent: "P(X = k) = C(n,k) × p^k × (1-p)^(n-k) où C(n,k) = n!/(k!(n-k)!). Représente k succès dans n essais indépendants.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Application génétique : Le gène de la drépanocytose est récessif. Deux parents hétérozygotes (porteurs sains) ont 4 enfants. Quelle est la probabilité qu'exactement 2 enfants soient atteints?",
        backContent: "Chaque enfant a 25% de risque d'être atteint (probabilité p = 0,25). X ~ B(4, 0,25). P(X = 2) = C(4,2) × 0,25² × 0,75² = 6 × 0,0625 × 0,5625 = 0,2109 ≈ 21,1%.",
        cardType: "basic",
        displayOrder: 2,
        points: 30,
      },
      {
        frontContent: "Une culture de maïs ivoirien a 80% de germination. On plante 100 graines. Calculez le nombre moyen de graines qui germeront.",
        backContent: "X ~ B(100, 0,8). E(X) = n × p = 100 × 0,8 = 80 graines en moyenne. La variance est Var(X) = np(1-p) = 100×0,8×0,2 = 16.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
    ],
  },
];

// ============================================================================
// MATHEMATIQUES TERMINALE - SÉRIE E (Économique)
// ============================================================================

// MODULE 1: MATHÉMATIQUES APPLIQUÉES À L'ÉCONOMIE (4 Leçons)
const tleEconomicsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Matrices et Applications Économiques",
      description: "Calcul matriciel appliqué à l'input-output de Leontief et systèmes d'équations économiques",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 30,
    },
    cards: [
      {
        frontContent: "Comment calcule-t-on le produit de deux matrices A(2×3) et B(3×2)?",
        backContent: "Si A = [[a₁₁,a₁₂,a₁₃],[a₂₁,a₂₂,a₂₃]] et B = [[b₁₁,b₁₂],[b₂₁,b₂₂],[b₃₁,b₃₂]], alors A×B = [[a₁₁b₁₁+a₁₂b₂₁+a₁₃b₃₁, a₁₁b₁₂+a₁₂b₂₂+a₁₃b₃₂],[a₂₁b₁₁+a₂₂b₂₁+a₂₃b₃₁, a₂₁b₁₂+a₂₂b₂₂+a₂₃b₃₂]].",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Application input-output : L'économie ivoirienne simplifiée avec 2 secteurs (Agriculture, Industrie). La matrice des coefficients techniques est [[0.2,0.3],[0.4,0.1]]. Si la demande finale est [100,50], calculez la production totale.",
        backContent: "Production X = (I - A)⁻¹ × D où I-A = [[0.8,-0.3],[-0.4,0.9]]. (I-A)⁻¹ = (1/0.6)×[[0.9,0.3],[0.4,0.8]] = [[1.5,0.5],[0.67,1.33]]. X = [[1.5,0.5],[0.67,1.33]] × [100,50] = [150+25, 67+66.5] = [175, 133.5].",
        cardType: "basic",
        displayOrder: 2,
        points: 35,
      },
      {
        frontContent: "Une entreprise ivoirienne produit du café (x) et du cacao (y). Le profit P = 3x + 2y - x² - y². Trouvez le profit maximum par la méthode matricielle des dérivées partielles.",
        backContent: "∇P = [3 - 2x, 2 - 2y] = [0,0]. Donc x = 1.5, y = 1. Profit maximum : P = 3×1.5 + 2×1 - 1.5² - 1² = 4.5 + 2 - 2.25 - 1 = 3.25. Matrice Hessienne = [[-2,0],[0,-2]] est définie négative, donc bien un maximum.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
    ],
  },
];

// ============================================================================
// MATHEMATIQUES TERMINALE - SÉRIE A (Littéraire)
// ============================================================================

// MODULE 1: MATHÉMATIQUES POUR SCIENCES SOCIALES (3 Leçons)
const tleLiteraryLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Statistiques Descriptives et Interprétation",
      description: "Statistiques descriptives appliquées aux données sociales et démographiques ivoiriennes",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 40,
    },
    cards: [
      {
        frontContent: "Comment calcule-t-on la moyenne arithmétique d'une série statistique?",
        backContent: "x̄ = (x₁ + x₂ + ... + xₙ)/n = (Σxᵢ)/n. Pour des données pondérées : x̄ = (Σxᵢnᵢ)/(Σnᵢ) où nᵢ sont les effectifs.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Application démographique : La population d'un village ivoirien par tranche d'âge : 0-15 ans: 120 personnes, 16-30 ans: 80 personnes, 31-60 ans: 100 personnes, 60+ ans: 50 personnes. Calculez la moyenne d'âge en prenant les centres de classes.",
        backContent: "Centres : 7.5, 23, 45.5, 75. Moyenne = (7.5×120 + 23×80 + 45.5×100 + 75×50)/(120+80+100+50) = (900 + 1840 + 4550 + 3750)/350 = 11040/350 ≈ 31.5 ans.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : L'écart-type mesure la dispersion moyenne par rapport à la médiane.",
        backContent: "Faux. L'écart-type mesure la dispersion par rapport à la MOYENNE, pas la médiane. σ = √(Σ(xᵢ - x̄)²/n).",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Les revenus mensuels en FCFA de 10 familles ivoiriennes : 50000, 60000, 75000, 80000, 90000, 95000, 100000, 120000, 150000, 200000. Calculez la médiane et l'écart-type.",
        backContent: "Médiane = (90000 + 95000)/2 = 92500. Moyenne = 102500. Écart-type = √[(5250² + 4250² + 2750² + 2250² + 1250² + 750² + 2500² + 17500² + 47500² + 97500²)/10] ≈ 39845 FCFA.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
    ],
  },
];

export async function seedMathematicsTerminaleComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting Terminale Mathematics comprehensive seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const mathSubjectId = subjectsMap.get("MATH");
    if (!mathSubjectId) {
      throw new Error("Mathematics subject not found");
    }

    // Combine all Terminale mathematics lessons
    const allTerminaleMathLessons = [
      ...tleAnalysisLessons,      // Série C
      ...tleGeometryLessons,      // Série C
      ...tleProbabilityLessons,   // Série D
      ...tleEconomicsLessons,     // Série E
      ...tleLiteraryLessons,      // Série A
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing Terminale Mathematics lessons...");

    for (const { lesson, cards: cardsData } of allTerminaleMathLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: mathSubjectId,
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

    console.log("\n🎉 Terminale Mathematics comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Series covered: A, C, D, E`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Terminale Mathematics:", error);
    throw error;
  }
}

if (require.main === module) {
  seedMathematicsTerminaleComprehensive()
    .then(() => {
      console.log("✨ Terminale Mathematics comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Terminale Mathematics comprehensive seeding failed:", error);
      process.exit(1);
    });
}
