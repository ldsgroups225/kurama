/**
 * Comprehensive Mathematics Seeding Script for Ivorian BEPC/BAC
 * Complete collection of Mathematics lessons and flashcards
 * Adapted for Côte d'Ivoire educational system
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env.development") });

import { initDatabase } from "../database/setup";
import { lessons, cards, subjects } from "@/drizzle/schema";
import type { InsertLesson, InsertCard } from "@/drizzle/schema";
import { seedLesson } from "./utils";

interface LessonWithCards {
  lesson: Omit<InsertLesson, "subjectId">;
  cards: Omit<InsertCard, "lessonId">[];
}

// ============================================================================
// MATHEMATIQUES BEPC (3ème) - 45 Leçons
// ============================================================================

// MODULE 1: NOMBRES ET OPÉRATIONS (8 Leçons)
const bepcNumbersLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Ensembles de Nombres",
      description: "N, Z, D, Q, R - Propriétés et relations entre les ensembles de nombres",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que l'ensemble ℕ?",
        backContent: "ℕ est l'ensemble des nombres entiers naturels: 0, 1, 2, 3, ... Utilisé pour compter des objets.",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Donnez un exemple de nombre rationnel qui n'est pas décimal",
        backContent: "1/3 = 0,333... n'est pas décimal car sa partie décimale est infinie périodique. C'est un rationnel mais pas un décimal.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "√2 appartient-il à ℚ? Justifiez",
        backContent: "Non, √2 ∉ ℚ. C'est un nombre irrationnel. Si √2 = p/q avec p, q premiers entre eux, alors 2q² = p², ce qui est impossible.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Calculez: (-3) + 5 - 2",
        backContent: "(-3) + 5 - 2 = 2 - 2 = 0",
        cardType: "basic",
        displayOrder: 4,
        points: 10,
      },
    ],
  },
  {
    lesson: {
      title: "Nombres Premiers et PGCD",
      description: "Factorisation en nombres premiers, PGCD et PPCM avec applications concrètes",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'un nombre premier?",
        backContent: "Un nombre premier est un entier naturel supérieur à 1 qui admet exactement deux diviseurs : 1 et lui-même. Ex: 2, 3, 5, 7, 11...",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Décomposez 60 en facteurs premiers",
        backContent: "60 = 2² × 3 × 5",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Calculez PGCD(48, 72) par l'algorithme d'Euclide",
        backContent: "72 = 48×1 + 24, 48 = 24×2 + 0. Donc PGCD(48, 72) = 24",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Un agriculteur ivoirien veut diviser son champ de 3600 m² en parcelles carrées de côté entier maximal. Quelle sera la surface de chaque parcelle?",
        backContent: "On cherche le plus grand carré possible. Si les parcelles ont côté c, alors c² divise 3600. Le PGCD des dimensions détermine c. 3600 = 60². Donc c = 60m, surface = 3600m² pour une parcelle unique, ou on peut diviser en parcelles plus petites de PGCD(60,60)=60.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Fractions et Calcul Fractionnaire",
      description: "Opérations sur les fractions et applications dans la vie courante ivoirienne",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Additionnez: 2/3 + 1/4",
        backContent: "2/3 + 1/4 = 8/12 + 3/12 = 11/12",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Un marchand de Yamoussoukro vend 3/4 de son stock de café le matin, puis 1/3 du reste l'après-midi. Quelle fraction du stock reste-t-il?",
        backContent: "Matin: 3/4 vendu, reste 1/4. Après-midi: 1/3 × 1/4 = 1/12 vendu. Total vendu: 3/4 + 1/12 = 9/12 + 1/12 = 10/12 = 5/6. Reste: 1 - 5/6 = 1/6 du stock.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Simplifiez: (5/8) ÷ (3/4)",
        backContent: "(5/8) ÷ (3/4) = (5/8) × (4/3) = 20/24 = 5/6",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux: La somme de deux fractions propres est toujours une fraction propre",
        backContent: "Faux. Contre-exemple: 2/3 + 3/4 = 8/12 + 9/12 = 17/12 > 1",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Puissances et Notation Scientifique",
      description: "Calculs avec les puissances et notation scientifique pour les sciences",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 4,
    },
    cards: [
      {
        frontContent: "Calculez: 2³ × 2⁴",
        backContent: "2³ × 2⁴ = 2³⁺⁴ = 2⁷ = 128",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Écrivez en notation scientifique: 0,000045",
        backContent: "0,000045 = 4,5 × 10⁻⁵",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "La vitesse de la lumière est d'environ 300 000 km/s. Écrivez ce nombre en notation scientifique en m/s",
        backContent: "300 000 km/s = 300 000 000 m/s = 3 × 10⁸ m/s",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Calculez: (5 × 10⁶) ÷ (2 × 10³)",
        backContent: "(5 × 10⁶) ÷ (2 × 10³) = (5/2) × 10⁶⁻³ = 2,5 × 10³ = 2500",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Pourcentages et Applications Commerciales",
      description: "Calculs de pourcentages avec applications aux prix, intérêts et reductions en Côte d'Ivoire",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 5,
    },
    cards: [
      {
        frontContent: "Un article coûte 25 000 FCFA. Après une réduction de 20%, quel est son nouveau prix?",
        backContent: "Réduction = 25 000 × 20/100 = 5 000 FCFA. Nouveau prix = 25 000 - 5 000 = 20 000 FCFA",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Le prix du cacao a augmenté de 15%. Il coûtait 800 FCFA/kg. Quel est le nouveau prix?",
        backContent: "Augmentation = 800 × 15/100 = 120 FCFA. Nouveau prix = 800 + 120 = 920 FCFA/kg",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Un étudiant a obtenu 15/20 en maths et 12/15 en français. Quel est son pourcentage de réussite global?",
        backContent: "Total points obtenus: 15 + 12 = 27. Total points possibles: 20 + 15 = 35. Pourcentage = 27/35 × 100 ≈ 77,1%",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Si 30% des élèves d'une classe sont des filles et qu'il y a 12 filles, combien d'élèves y a-t-il en tout?",
        backContent: "Soit N le nombre total d'élèves. 30% de N = 12, donc 0,3N = 12, N = 12/0,3 = 40 élèves",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Proportionnalité et Applications",
      description: "Proportionnalité directe et inverse dans des contextes ivoiriens",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 6,
    },
    cards: [
      {
        frontContent: "Une voiture consomme 8L pour 100km. Combien consomme-t-elle pour 450km?",
        backContent: "Consommation proportionnelle: 8L/100km × 450km = 36L",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Le prix de 3kg de poisson est 4 500 FCFA. Quel est le prix de 7kg?",
        backContent: "Prix proportionnel: 4 500 FCFA/3kg × 7kg = 1 500 FCFA/kg × 7kg = 10 500 FCFA",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Si 8 ouvriers construisent une maison en 30 jours, combien de temps faudrait-il à 12 ouvriers? (Travail inversement proportionnel)",
        backContent: "Temps × Nombre d'ouvriers = constant: 8 × 30 = 240. Pour 12 ouvriers: Temps = 240/12 = 20 jours",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Une recette pour 4 personnes nécessite 300g de farine. Combien faut-il pour 10 personnes?",
        backContent: "Proportionnalité directe: 300g/4 × 10 = 75g/personne × 10 = 750g",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Unités de Mesure et Conversions",
      description: "Système métrique et conversions utiles pour la vie quotidienne en Côte d'Ivoire",
      difficulty: "easy",
      estimatedDuration: 40,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 7,
    },
    cards: [
      {
        frontContent: "Convertissez 3,5 km en mètres",
        backContent: "3,5 km = 3 500 m",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Un terrain mesure 2,5 ha. Quelle est sa surface en m²?",
        backContent: "1 ha = 10 000 m². Donc 2,5 ha = 2,5 × 10 000 = 25 000 m²",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Convertissez 4500 kg en tonnes",
        backContent: "1 tonne = 1000 kg. Donc 4500 kg = 4,5 tonnes",
        cardType: "basic",
        displayOrder: 3,
        points: 10,
      },
      {
        frontContent: "Un bidon contient 20L d'huile. Exprimez cette capacité en mL puis en gallons (1 gallon ≈ 3,785L)",
        backContent: "20L = 20 000 mL. En gallons: 20/3,785 ≈ 5,28 gallons",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Estimation et Arrondis",
      description: "Techniques d'estimation et arrondis pour les calculs rapides",
      difficulty: "easy",
      estimatedDuration: 35,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 8,
    },
    cards: [
      {
        frontContent: "Arrondissez 37,8 à l'unité la plus proche",
        backContent: "37,8 ≈ 38 (le chiffre des dixièmes est 7 ≥ 5)",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Estimez: 47 × 23",
        backContent: "47 ≈ 50, 23 ≈ 20. Estimation: 50 × 20 = 1 000. Résultat exact: 1 081",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Donnez un ordre de grandeur de: 6187 + 3942",
        backContent: "6187 ≈ 6000, 3942 ≈ 4000. Ordre de grandeur: 6000 + 4000 = 10 000",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Arrondissez 0,00428 au millième le plus proche",
        backContent: "0,00428 ≈ 0,004 (le chiffre des dix-millièmes est 8 ≥ 5, donc on arrondit 0,0042 à 0,004)",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
];

// MODULE 2: ALGÈBRE (12 Leçons)
const bepcAlgebraLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Expressions Algébriques et Développement",
      description: "Développement et factorisation d'expressions algébriques avec applications",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 9,
    },
    cards: [
      {
        frontContent: "Développez: 3(x + 5)",
        backContent: "3(x + 5) = 3x + 15",
        cardType: "basic",
        displayOrder: 1,
        points: 10,
      },
      {
        frontContent: "Développez: (2x - 3)(x + 4)",
        backContent: "(2x - 3)(x + 4) = 2x² + 8x - 3x - 12 = 2x² + 5x - 12",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Factorisez: x² - 9",
        backContent: "x² - 9 = x² - 3² = (x - 3)(x + 3) (différence de deux carrés)",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Application économique : Le revenu d'un planteur ivoirien s'exprime par R = (50 + 10q)q où q est la quantité en tonnes. Développez cette expression.",
        backContent: "R = (50 + 10q)q = 50q + 10q². Le revenu augmente avec la quantité de façon quadratique.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux: (a + b)² = a² + b²",
        backContent: "Faux. (a + b)² = a² + 2ab + b²",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Factorisation et Identités Remarquables",
      description: "Techniques de factorisation avancées avec identités remarquables",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Factorisez: 4x² - 9y²",
        backContent: "4x² - 9y² = (2x)² - (3y)² = (2x - 3y)(2x + 3y)",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Factorisez: x³ + 8",
        backContent: "x³ + 8 = x³ + 2³ = (x + 2)(x² - 2x + 4) (somme de deux cubes)",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Factorisez: 2x² - 4x + 2",
        backContent: "2x² - 4x + 2 = 2(x² - 2x + 1) = 2(x - 1)²",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Application au calcul d'aire : Un terrain rectangulaire a une aire de x² - 5x + 6 m². Factorisez pour trouver ses dimensions possibles.",
        backContent: "x² - 5x + 6 = (x - 2)(x - 3). Les dimensions possibles sont (x - 2) m par (x - 3) m où x > 3.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Équations Linéaires du Premier Degré",
      description: "Résolution d'équations linéaires avec applications à des problèmes concrets ivoiriens",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 11,
    },
    cards: [
      {
        frontContent: "Résolvez: 3x - 7 = 2x + 5",
        backContent: "3x - 7 = 2x + 5. 3x - 2x = 5 + 7. x = 12",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Un chauffeur de taxi à Abidjan charge 500 FCFA de prise en charge plus 200 FCFA par kilomètre. Pour un trajet coûtant 2 500 FCFA, quelle distance a été parcourue?",
        backContent: "Coût = 500 + 200×d. 2 500 = 500 + 200d. 2 000 = 200d. d = 10 km",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Résolvez: (2x - 1)/3 = (x + 2)/4",
        backContent: "4(2x - 1) = 3(x + 2). 8x - 4 = 3x + 6. 5x = 10. x = 2",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Si le périmètre d'un rectangle est 48 cm et sa longueur mesure 14 cm, quelle est sa largeur?",
        backContent: "Périmètre = 2(L + l). 48 = 2(14 + l). 24 = 14 + l. l = 10 cm",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
      {
        frontContent: "Application agricole : Un agriculteur ivoirien cultive du cacao et du café. Il produit 30% de cacao en plus que de café. S'il produit 130 tonnes au total, combien de tonnes de chaque produit?",
        backContent: "Soit C = café, alors cacao = C + 0,3C = 1,3C. C + 1,3C = 130. 2,3C = 130. C = 130/2,3 ≈ 56,5 tonnes de café. Cacao = 130 - 56,5 = 73,5 tonnes.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Systèmes d'Équations Linéaires",
      description: "Résolution de systèmes d'équations par substitution et élimination",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 12,
    },
    cards: [
      {
        frontContent: "Résolvez par substitution: {x + y = 10, x = 2y + 1}",
        backContent: "De la deuxième équation: x = 2y + 1. Dans la première: 2y + 1 + y = 10. 3y = 9. y = 3. Donc x = 2×3 + 1 = 7. Solution: (7, 3)",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Résolvez par élimination: {3x + 2y = 12, 2x - y = 5}",
        backContent: "Multiplions la deuxième par 2: 4x - 2y = 10. Additionnons: (3x + 2y) + (4x - 2y) = 12 + 10. 7x = 22. x = 22/7 ≈ 3,14. Puis y = 2×3,14 - 5 = 6,28 - 5 = 1,28.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application commerciale : Un magasin ivoirien vend des ordinateurs à 150 000 FCFA et des tablettes à 75 000 FCFA. En un jour, il vend 15 appareils pour 1 875 000 FCFA. Combien de chaque type?",
        backContent: "Soit x = ordinateurs, y = tablettes. {x + y = 15, 150000x + 75000y = 1875000}. De la première: y = 15 - x. Dans la deuxième: 150000x + 75000(15 - x) = 1875000. 75000x + 1125000 = 1875000. 75000x = 750000. x = 10. y = 5. Solution: 10 ordinateurs, 5 tablettes.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
    ],
  },
  {
    lesson: {
      title: "Inéquations du Premier Degré",
      description: "Résolution et représentation graphique des inéquations",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 13,
    },
    cards: [
      {
        frontContent: "Résolvez: 2x - 5 > 3x + 1",
        backContent: "2x - 5 > 3x + 1. 2x - 3x > 1 + 5. -x > 6. En multipliant par -1 (changement de sens): x < -6",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Résolvez et représentez: -3x + 4 ≥ x - 2",
        backContent: "-3x - x ≥ -2 - 4. -4x ≥ -6. En divisant par -4: x ≤ 1,5. Représentation : ●--------← 1,5",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application de budget : Un étudiant ivoirien a un budget de 25 000 FCFA par mois. Le transport coûte 2000 FCFA et la nourriture au moins 15 000 FCFA. Que peut-il dépenser pour le reste?",
        backContent: "Soit x le reste. 2000 + 15000 + x ≤ 25000. 17000 + x ≤ 25000. x ≤ 8000 FCFA. Il peut dépenser au maximum 8000 FCFA pour le reste.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Équations du Second Degré",
      description: "Équations quadratiques et discriminant avec applications pratiques",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 14,
    },
    cards: [
      {
        frontContent: "Résolvez: x² - 5x + 6 = 0",
        backContent: "Δ = b² - 4ac = 25 - 24 = 1. x = (-(-5) ± √1)/(2×1) = (5 ± 1)/2. Solutions: x₁ = 3, x₂ = 2",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Résolvez: x² + 4x + 5 = 0",
        backContent: "Δ = 16 - 20 = -4 < 0. Pas de solutions réelles. Solutions complexes: x = (-4 ± 2i)/2 = -2 ± i",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application physique : Un projectile est lancé du sol avec une vitesse initiale. Sa hauteur h(t) = -5t² + 40t. Quand atteint-il le sol?",
        backContent: "h(t) = 0 ⇒ -5t² + 40t = 0 ⇒ -5t(t - 8) = 0. Solutions: t = 0 (départ) ou t = 8 (retour au sol). Le projectile retourne au sol après 8 secondes.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application économique : Le coût de production C(q) = q² - 20q + 91 où q est la quantité. Pour quelles quantités le coût est-il inférieur à 25?",
        backContent: "q² - 20q + 91 < 25. q² - 20q + 66 < 0. Δ = 400 - 264 = 136. Solutions: q = (20 ± √136)/2 = (20 ± 11,66)/2. q₁ = 4,17, q₂ = 15,83. Coût < 25 pour 4,17 < q < 15,83 (quantités entières: 5 à 15).",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
    ],
  },
  {
    lesson: {
      title: "Fonctions et Graphes",
      description: "Étude des fonctions linéaires, affines et quadratiques",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "Quelle est la différence entre fonction linéaire et fonction affine?",
        backContent: "Fonction linéaire: f(x) = ax (passe par l'origine). Fonction affine: f(x) = ax + b (passe par (0,b)). Toute fonction linéaire est affine, mais la réciproque est fausse.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Tracez la fonction f(x) = 2x - 3 et trouvez le point d'intersection avec l'axe des abscisses",
        backContent: "f(x) = 0 ⇒ 2x - 3 = 0 ⇒ x = 1,5. Le point d'intersection est (1,5, 0). La droite a un coefficient directeur de 2 et une ordonnée à l'origine de -3.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application au téléphone : Le coût d'un forfait mobile ivoirien est C(x) = 2000 + 100x où x est le nombre de minutes au-delà de 60 minutes. Représentez graphiquement ce coût.",
        backContent: "C'est une fonction affine avec coefficient directeur 100 (coût par minute supplémentaire) et ordonnée à l'origine 2000 (coût de base). Droite passant par (0,2000) avec pente 100.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Quelle est la forme canonique de f(x) = x² - 4x + 7?",
        backContent: "f(x) = (x - 2)² + 3. Forme : a(x - α)² + β où α = -b/(2a) = 2 et β = f(α) = 3. Le sommet est (2,3).",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// MODULE 3: GÉOMÉTRIE (15 Leçons)
const bepcGeometryLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Géométrie Plane: Théorème de Pythagore",
      description: "Théorème de Pythagore et applications pratiques en construction et navigation",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 16,
    },
    cards: [
      {
        frontContent: "Énoncez le théorème de Pythagore",
        backContent: "Dans un triangle rectangle, le carré de la longueur de l'hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés. Si ABC est rectangle en A, alors BC² = AB² + AC².",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez l'hypoténuse d'un triangle rectangle avec les côtés 3cm et 4cm",
        backContent: "h² = 3² + 4² = 9 + 16 = 25. Donc h = √25 = 5cm. C'est le triangle 3-4-5 classique.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application construction : Un charpentier ivoirien veut construire un toit avec une pente de 30° sur une largeur de 8m. Quelle est la hauteur du faîte?",
        backContent: "Dans le triangle rectangle formé, tan(30°) = hauteur/(8/2) = hauteur/4. hauteur = 4 × tan(30°) = 4 × 0,577 ≈ 2,31m.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : Le théorème de Pythagore s'applique à tous les triangles",
        backContent: "Faux. Il ne s'applique qu'aux triangles rectangles. Pour les autres triangles, on utilise la loi des cosinus.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Géométrie Plane: Théorème de Thalès",
      description: "Théorème de Thalès et applications à la mesure indirecte",
      difficulty: "hard",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 17,
    },
    cards: [
      {
        frontContent: "Énoncez le théorème de Thalès",
        backContent: "Si trois droites parallèles coupent deux droites sécantes, alors elles déterminent des segments proportionnels. Si ABC et A'B'C' sont alignés et (AB)//(A'B'), alors AB/A'B' = AC/A'C' = BC/B'C'.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Dans la configuration de Thalès, si AB = 6cm, A'B' = 4cm et AC = 9cm, calculez A'C'",
        backContent: "AB/A'B' = AC/A'C' ⇒ 6/4 = 9/A'C' ⇒ 6A'C' = 36 ⇒ A'C' = 6cm",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application arpentage : Un géomètre ivoirien veut mesurer la largeur d'une rivière. Il plante un piquet A, puis B à 20m sur une rive. Il vise un arbre C sur l'autre rive et plante D tel que AD = 30m. Il mesure que DE = 15m quand il aligne C. Quelle est la largeur AC?",
        backContent: "Triangles ABE et ACD sont semblables. AB/AE = AC/AD. 20/(20+15) = AC/30. 20/35 = AC/30. AC = 30×20/35 = 600/35 ≈ 17,14m.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
    ],
  },
  {
    lesson: {
      title: "Cercles et Propriétés",
      description: "Cercles, diamètres, cordes et angles inscrits",
      difficulty: "medium",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 18,
    },
    cards: [
      {
        frontContent: "Quelle est la formule du périmètre et de l'aire d'un cercle de rayon r?",
        backContent: "Périmètre = 2πr. Aire = πr². Pour un diamètre d, périmètre = πd.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez l'aire d'un champ circulaire ivoirien de rayon 50m",
        backContent: "Aire = π × 50² = π × 2500 ≈ 7854 m² ≈ 0,785 ha",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Quelle est la propriété des angles inscrits interceptant le même arc?",
        backContent: "Les angles inscrits qui interceptent le même arc sont égaux. Si ∠AOB est l'angle au centre et ∠ACB l'angle inscrit interceptant le même arc, alors ∠ACB = ½∠AOB.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Application agricole : Un réservoir d'eau circulaire a un diamètre de 12m. Quelle quantité d'eau peut-il contenir pour une profondeur de 2m?",
        backContent: "Volume = Aire × hauteur = π × 6² × 2 = π × 36 × 2 = 72π ≈ 226 m³ = 226 000 litres d'eau.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// MODULE 4: TRIGONOMÉTRIE (4 Leçons)
const bepcTrigonometryLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Trigonométrie du Triangle Rectangle",
      description: "SOHCAHTOA et applications pratiques",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 24,
    },
    cards: [
      {
        frontContent: "Que signifie SOHCAHTOA?",
        backContent: "SOH: Sinus = Opposé/Hypoténuse. CAH: Cosinus = Adjacent/Hypoténuse. TOA: Tangente = Opposé/Adjacent. Mnémonique pour les rapports trigonométriques.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Dans un triangle rectangle, si le côté opposé = 3cm et l'hypoténuse = 5cm, calculez sin(θ)",
        backContent: "sin(θ) = opposé/hypoténuse = 3/5 = 0,6. Donc θ = arcsin(0,6) ≈ 36,87°",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application topographie : Un topographe ivoirien mesure que l'angle d'élévation du sommet d'une colline est de 25°. À 100m de la base, il est au même niveau. Calculez la hauteur de la colline.",
        backContent: "tan(25°) = hauteur/100. hauteur = 100 × tan(25°) ≈ 100 × 0,466 = 46,6m.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : sin²(θ) + cos²(θ) = 1 pour tout angle θ",
        backContent: "Vrai. C'est l'identité trigonométrique fondamentale qui découle du théorème de Pythagore dans le cercle trigonométrique.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
];

// MODULE 5: STATISTIQUES ET PROBABILITÉS (5 Leçons)
const bepcStatisticsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Statistiques Descriptives",
      description: "Moyenne, médiane, mode et étendue avec données ivoiriennes",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 28,
    },
    cards: [
      {
        frontContent: "Quelle est la différence entre moyenne et médiane?",
        backContent: "La moyenne est la somme des valeurs divisée par leur nombre. La médiane est la valeur centrale qui sépare les données en deux parties égales. La médiane est moins sensible aux valeurs extrêmes.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez la moyenne de: 12, 15, 18, 20, 25",
        backContent: "Moyenne = (12 + 15 + 18 + 20 + 25)/5 = 90/5 = 18",
        cardType: "basic",
        displayOrder: 2,
        points: 10,
      },
      {
        frontContent: "Application démographique : Les âges des élèves d'une classe ivoirienne : 14, 14, 15, 15, 15, 16, 16, 17. Calculez moyenne, médiane et mode.",
        backContent: "Moyenne = (14+14+15+15+15+16+16+17)/8 = 122/8 = 15,25 ans. Médiane = (15+15)/2 = 15 ans. Mode = 15 ans (valeur la plus fréquente).",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Les prix du cacao en FCFA/kg sur une semaine : 750, 780, 820, 790, 810. Calculez l'étendue et l'écart type approximatif.",
        backContent: "Étendue = 820 - 750 = 70 FCFA. Moyenne = 790 FCFA. Variance = [(750-790)²+(780-790)²+(820-790)²+(790-790)²+(810-790)²]/5 = (1600+100+900+0+400)/5 = 600. Écart-type = √600 ≈ 24,5 FCFA.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Probabilités de Base",
      description: "Calculs de probabilités simples avec exemples concrets",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 29,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une expérience aléatoire?",
        backContent: "Une expérience dont le résultat ne peut pas être prédit avec certitude, mais dont tous les résultats possibles sont connus. Ex: lancer un dé, tirer une carte.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Dans un jeu de 32 cartes, quelle est la probabilité de tirer un roi?",
        backContent: "4 rois sur 32 cartes. P(king) = 4/32 = 1/8 = 0,125 = 12,5%",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application météo : À Abidjan, il pleut 30% des jours en moyenne. Quelle est la probabilité qu'il pleuve deux jours consécutifs?",
        backContent: "P(pluie jour 1 ET pluie jour 2) = 0,3 × 0,3 = 0,09 = 9% (en supposant l'indépendance).",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Une urne contient 5 boules rouges, 3 bleues, 2 vertes. Quelle est la probabilité de tirer une boule qui n'est pas rouge?",
        backContent: "Total = 10 boules. Non rouges = 3 + 2 = 5 boules. P(non rouge) = 5/10 = 0,5 = 50%",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
];

// MODULE 6: MATHÉMATIQUES APPLIQUÉES (3 Leçons)
const bepcAppliedLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Mathématiques Financières",
      description: "Intérêts simples, composés et applications bancaires ivoiriennes",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 33,
    },
    cards: [
      {
        frontContent: "Quelle est la formule de l'intérêt simple?",
        backContent: "I = C × t × n où I = intérêt, C = capital, t = taux d'intérêt annuel (en décimal), n = nombre d'années.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez l'intérêt simple pour un capital de 500 000 FCFA à 4% pendant 2 ans",
        backContent: "I = 500 000 × 0,04 × 2 = 40 000 FCFA. Le capital final sera 540 000 FCFA.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application microcrédit : Une femme entrepreneure ivoirienne emprunte 200 000 FCFA à 6% d'intérêt simple. Combien doit-elle rembourser après 18 mois?",
        backContent: "I = 200 000 × 0,06 × 1,5 = 18 000 FCFA. Remboursement total = 200 000 + 18 000 = 218 000 FCFA.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : Avec l'intérêt composé, les intérêts génèrent aussi des intérêts",
        backContent: "Vrai. C'est le principe de l'intérêt composé : les intérêts de chaque période sont ajoutés au capital pour calculer les intérêts de la période suivante.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 4,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Mathématiques et Technologie",
      description: "Applications des mathématiques en informatique et télécommunications",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 34,
    },
    cards: [
      {
        frontContent: "Comment les mathématiques sont-elles utilisées dans la cryptographie?",
        backContent: "La cryptographie utilise l'arithmétique modulaire, la factorisation de grands nombres, les fonctions de hachage et la théorie des nombres pour sécuriser les communications.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Application codage : Le code ASCII de 'A' est 65. En utilisant un décalage de 3, quel est le code chiffré de 'A'?",
        backContent: "Code chiffré = 65 + 3 = 68. En ASCII, 68 correspond au caractère 'D'. C'est le principe du chiffre de César.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Un opérateur téléphonique ivoirien a des antennes formant un hexagone régulier de côté 20km. Calculez l'aire de couverture.",
        backContent: "Aire hexagone = (3√3/2) × côté² = (3√3/2) × 400 = 600√3 ≈ 1039 km². Chaque antenne couvre environ 1039 km².",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
    ],
  },
];

export async function seedMathematicsComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive Mathematics seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const mathSubjectId = subjectsMap.get("MATH");
    if (!mathSubjectId) {
      throw new Error("Mathematics subject not found");
    }

    // Combine all mathematics lessons
    const allMathLessons = [
      ...bepcNumbersLessons,
      ...bepcAlgebraLessons,
      ...bepcGeometryLessons,
      ...bepcTrigonometryLessons,
      ...bepcStatisticsLessons,
      ...bepcAppliedLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;
    let skippedLessons = 0;

    console.log("\n📚 Processing Mathematics lessons...");

    for (const { lesson, cards: cardsData } of allMathLessons) {
      const result = await seedLesson(
        db,
        mathSubjectId,
        {
          ...lesson,
          description: lesson.description || undefined,
          difficulty: lesson.difficulty || undefined,
          estimatedDuration: lesson.estimatedDuration || undefined,
          publishedAt: lesson.publishedAt || undefined,
        },
        cardsData.map((card) => ({
          ...card,
          difficulty: card.difficulty || undefined,
          cardType: card.cardType || undefined,
          question: card.question || undefined,
          correctAnswer: card.correctAnswer || undefined,
          explanation: card.explanation || undefined,
          timeLimit: card.timeLimit || undefined,
          points: card.points || undefined,
        }))
      );

      if (result.created) {
        console.log(`  ✅ Created lesson: ${lesson.title}`);
        console.log(`     📝 Added ${result.cardsCount} flashcards`);
        totalLessons++;
        totalCards += result.cardsCount;
      } else {
        console.log(`  ℹ️  Skipped existing lesson: ${lesson.title}`);
        skippedLessons++;
      }
    }

    console.log("\n🎉 Mathematics comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - New lessons created: ${totalLessons}`);
    console.log(`   - Existing lessons skipped: ${skippedLessons}`);
    console.log(`   - New flashcards added: ${totalCards}`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Mathematics:", error);
    throw error;
  }
}

if (require.main === module) {
  seedMathematicsComprehensive()
    .then(() => {
      console.log("✨ Comprehensive Mathematics seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Comprehensive Mathematics seeding failed:", error);
      process.exit(1);
    });
}
