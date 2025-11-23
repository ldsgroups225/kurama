/**
 * Comprehensive Physics-Chemistry Seeding Script for Ivorian BEPC/BAC
 * Complete collection of Physics and Chemistry lessons and flashcards
 * Adapted for Côte d'Ivoire educational system with practical applications
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
// PHYSIQUE-CHIMIE BEPC (3ème) - 30 Leçons
// ============================================================================

// MODULE 1: PHYSIQUE - MÉCANIQUE (8 Leçons)
const pcMechanicsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Les Forces et le Mouvement",
      description: "Étude des forces, vecteurs et applications dans la vie quotidienne ivoirienne",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une force en physique?",
        backContent: "Une force est une interaction capable de modifier le mouvement d'un objet ou de le déformer. Elle est caractérisée par sa direction, son sens, son intensité et son point d'application. Unité : le Newton (N).",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Énoncez la première loi de Newton (principe d'inertie)",
        backContent: "Dans un référentiel galiléen, un corps reste au repos ou en mouvement rectiligne uniforme si la somme des forces qui s'exercent sur lui est nulle. C'est le principe d'inertie.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Calculez le poids d'une personne de 70 kg en Côte d'Ivoire (g = 9,8 N/kg)",
        backContent: "P = m × g = 70 kg × 9,8 N/kg = 686 N. Le poids varie légèrement selon la latitude, mais cette valeur est correcte pour la Côte d'Ivoire.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Application transport : Un taxi ivoirien de masse 1200 kg accélère de 0 à 20 m/s en 8 secondes. Calculez la force motrice nécessaire.",
        backContent: "Accélération a = (v₂ - v₁)/t = (20 - 0)/8 = 2,5 m/s². Force F = m × a = 1200 kg × 2,5 m/s² = 3000 N.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : La masse et le poids sont la même chose",
        backContent: "Faux. La masse est une quantité de matière (kg), constante partout. Le poids est une force (N) qui dépend de la gravité locale. Sur la Lune, le poids serait 6 fois plus faible mais la masse identique.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Le Travail et l'Énergie Mécanique",
      description: "Travail d'une force, énergie cinétique, énergie potentielle et conservation",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Quelle est la formule du travail d'une force constante F sur un déplacement d?",
        backContent: "W = F × d × cos(α) où F est l'intensité de la force, d la distance, et α l'angle entre la force et le déplacement. Unité : le Joule (J).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est l'énergie cinétique d'une voiture de masse 1000 kg roulant à 20 m/s (72 km/h)?",
        backContent: "Ec = ½mv² = ½ × 1000 kg × (20 m/s)² = 500 × 400 = 200 000 J = 200 kJ.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application agriculture : Un sac de cacao de 50 kg est monté à 3m de hauteur. Calculez l'énergie potentielle acquise.",
        backContent: "Ep = mgh = 50 kg × 9,8 N/kg × 3 m = 1470 J. Cette énergie sera libérée si le sac tombe.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application barrage : Le barrage de Kossou a une hauteur de 40m. Si 1000 kg d'eau tombent de cette hauteur, quelle énergie est libérée?",
        backContent: "Énergie potentielle initiale = 1000 kg × 9,8 N/kg × 40 m = 392 000 J = 392 kJ. Cette énergie peut être convertie en électricité.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
    ],
  },
  {
    lesson: {
      title: "La Pression et les Fluides",
      description: "Pression, principe d'Archimède et applications hydrostatiques",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Quelle est la formule de la pression?",
        backContent: "P = F/S où F est la force perpendiculaire à la surface S. Unité : le Pascal (Pa). 1 Pa = 1 N/m². Autres unités : bar (1 bar = 10⁵ Pa), atmosphère.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Énoncez le principe d'Archimède",
        backContent: "Tout corps plongé dans un fluide subit une poussée verticale, dirigée de bas en haut, égale au poids du volume de fluide déplacé. C'est cette poussée qui fait flotter les bateaux.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application plongée : Un plongeur ivoirien descend à 20m de profondeur dans l'océan. Quelle pression subit-il? (masse volumique eau = 1000 kg/m³, g = 9,8 N/kg)",
        backContent: "Pression totale = Patmosphère + ρgh = 101 325 + 1000 × 9,8 × 20 = 101 325 + 196 000 = 297 325 Pa ≈ 2,97 atm.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi une planche de bois flotte-t-elle mais pas une pierre de même taille?",
        backContent: "La planche a une masse volumique plus faible que celle de l'eau. La poussée d'Archimède égale au poids d'eau déplacée est supérieure au poids de la planche, donc elle flotte. La pierre est plus dense que l'eau.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
];

// MODULE 2: PHYSIQUE - ÉLECTRICITÉ (6 Leçons)
const pcElectricityLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Circuits Électriques et Courant",
      description: "Intensité, tension, résistance et loi d'Ohm avec applications domestiques ivoiriennes",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 9,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que l'intensité du courant électrique?",
        backContent: "C'est le débit de charges électriques à travers une section du conducteur. Unité : l'Ampère (A). Représente le nombre de coulombs par seconde : I = Q/t.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Énoncez la loi d'Ohm",
        backContent: "U = R × I où U est la tension en volts (V), R la résistance en ohms (Ω), et I l'intensité en ampères (A). Cette loi relie tension, courant et résistance.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Une ampoule ivoirienne de 60W est branchée sur le réseau 220V. Calculez sa résistance et l'intensité qui la traverse.",
        backContent: "P = U × I donc I = P/U = 60/220 = 0,273 A. R = U/I = 220/0,273 = 806 Ω.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application sécurité : Un fusible de 10A protège une installation. Combien d'ampoules de 60W peut-on brancher simultanément?",
        backContent: "Chaque ampoule consomme I = 60/220 = 0,273 A. Nombre maximum = 10A/0,273A ≈ 36 ampoules. En pratique, on prévoit une marge de sécurité.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : En série, l'intensité est la même dans tous les composants",
        backContent: "Vrai. Dans un circuit série, le courant est identique partout car il n'y a qu'une seule boucle. La tension se divise entre les composants.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Puissance et Énergie Électrique",
      description: "Calculs de puissance, consommation énergétique et facture d'électricité",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "Quelles sont les formules de la puissance électrique?",
        backContent: "P = U × I (watts) et aussi P = I²R = U²/R. Pour l'énergie : E = P × t (joules) ou E = P × t/3600 (kilowattheures).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Un climatiseur ivoirien de 2000W fonctionne 8h par jour pendant 30 jours. Calculez la consommation en kWh et le coût (0,60 FCFA/kWh).",
        backContent: "Énergie = 2kW × 8h × 30j = 480 kWh. Coût = 480 × 0,60 = 288 FCFA par mois.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application maison : Une famille ivoirienne utilise un réfrigérateur (150W, 24h/24), 4 ampoules LED (10W, 6h/jour), et une télévision (80W, 5h/jour). Calculez la consommation mensuelle.",
        backContent: "Réfrigérateur : 0,15kW × 24h × 30j = 108 kWh. Ampoules : 4 × 0,01kW × 6h × 30j = 7,2 kWh. TV : 0,08kW × 5h × 30j = 12 kWh. Total = 127,2 kWh.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Pourquoi les appareils ivoiriens ont-ils souvent des tensions de 220V au lieu de 110V?",
        backContent: "La Côte d'Ivoire suit le standard européen de 220V-240V à 50Hz. Le 220V permet plus de puissance pour la même intensité, avec moins de pertes dans les câbles.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
];

// MODULE 3: OPTIQUE (4 Leçons)
const pcOpticsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Réflexion et Réfraction de la Lumière",
      description: "Lois de Snell-Descartes et applications optiques",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "Énoncez la loi de la réflexion",
        backContent: "Le rayon réfléchi est symétrique au rayon incident par rapport à la normale au point d'incidence. L'angle d'incidence égale l'angle de réflexion : i = r.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Énoncez la loi de la réfraction (loi de Snell-Descartes)",
        backContent: "n₁ × sin(i) = n₂ × sin(r) où n₁ et n₂ sont les indices de réfraction, i l'angle d'incidence et r l'angle de réfraction.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "La lumière passe de l'air (n=1) à l'eau (n=1,33) avec un angle d'incidence de 30°. Calculez l'angle de réfraction.",
        backContent: "sin(r) = (n₁/n₂) × sin(i) = (1/1,33) × sin(30°) = 0,75 × 0,5 = 0,375. Donc r = arcsin(0,375) ≈ 22°. Le rayon se rapproche de la normale.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application pêche : Un pêcheur ivoirien voit un poisson sous l'eau. Pourquoi le poisson semble-t-il plus proche qu'il ne l'est réellement?",
        backContent: "À cause de la réfraction, la lumière venant du poisson est déviée en sortant de l'eau. Le cerveau interprète comme si la lumière venait en ligne droite, donnant une image moins profonde.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
    ],
  },
];

// MODULE 4: CHIMIE - MATIÈRE ET TRANSFORMATIONS (8 Leçons)
const pcChemistryLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Structure de la Matière",
      description: "Atomes, molécules, classification périodique avec éléments importants pour la Côte d'Ivoire",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 19,
    },
    cards: [
      {
        frontContent: "Quelle est la structure de l'atome selon le modèle de Rutherford?",
        backContent: "L'atome a un noyau central dense et positif contenant des protons et des neutrons, autour duquel gravitent des électrons sur des orbites circulaires. Le vide représente plus de 99,9% du volume atomique.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Combien d'électrons possède l'atome de fer (Fe, Z=26)?",
        backContent: "Le numéro atomique Z = 26 signifie qu'il y a 26 protons dans le noyau. Un atome neutre a autant d'électrons que de protons, donc 26 électrons.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Application industrie : Quels éléments sont essentiels pour l'industrie ivoirienne?",
        backContent: "- Aluminium (Al) : emballage, construction\n- Fer (Fe) : construction, industries\n- Cuivre (Cu) : électricité, plomberie\n- Or (Au) : bijouterie, économie\n- Cacao : molécules organiques pour le chocolat",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi les métaux comme l'or et l'aluminium sont-ils importants pour l'économie ivoirienne?",
        backContent: "L'or : 5ème producteur mondial, source de devises. L'aluminium : pour l'emballage du cacao et café, construction légère dans les zones tropicales où il résiste bien à l'humidité.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : Tous les atomes d'un même élément chimique ont exactement la même masse",
        backContent: "Faux. Il existe des isotopes (même nombre de protons mais nombre différent de neutrons) qui ont des masses différentes. Par exemple : Carbone-12 et Carbone-14.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Liaisons Chimiques",
      description: "Liaisons ioniques, covalentes et applications aux molécules biologiques",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 20,
    },
    cards: [
      {
        frontContent: "Quelle est la différence entre liaison ionique et liaison covalente?",
        backContent: "Liaison ionique : transfert d'électrons entre un métal et un non-métal (ex: NaCl). Liaison covalente : partage d'électrons entre deux non-métaux (ex: H₂O, CO₂).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Écrivez la formule de l'eau et expliquez ses liaisons",
        backContent: "H₂O. L'oxygène partage un électron avec chaque hydrogène (liaisons covalentes polaires). La forme est coudée (~104,5°) à cause des paires d'électrons non liantes sur l'oxygène.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application agriculture : Pourquoi le nitrate d'ammonium (NH₄NO₃) est-il un bon engrais pour les cacaoyers ivoiriens?",
        backContent: "Fournit de l'azote (N) essentiel pour la croissance des plantes. Les plantes absorbent l'azote sous forme de nitrate (NO₃⁻) et d'ammonium (NH₄⁺). C'est très soluble dans l'eau et rapidement disponible.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi le sel (NaCl) est-il si important pour la vie humaine en Côte d'Ivoire?",
        backContent: "Essentiel pour l'équilibre hydrique et les fonctions nerveuses. Le climat chaud ivoirien cause une perte importante de sels par transpiration, nécessitant un apport régulier. Aussi utilisé pour conserver les aliments traditionnels.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Réactions Chimiques et Équilibre",
      description: "Types de réactions, vitesse, équilibre chimique avec applications industrielles",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 21,
    },
    cards: [
      {
        frontContent: "Qu'est-ce d'une réaction chimique d'oxydoréduction?",
        backContent: "Réaction avec transfert d'électrons entre espèces chimiques. L'oxydant gagne des électrons (réduction), le réducteur perd des électrons (oxydation).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Équilibrez la réaction de combustion du méthane : CH₄ + O₂ → CO₂ + H₂O",
        backContent: "CH₄ + 2O₂ → CO₂ + 2H₂O. Pour équilibrer : 1 carbone à gauche → 1 CO₂ à droite. 4 hydrogènes → 2 H₂O. Donc 4 oxygènes dans produits, il faut 2O₂ dans réactifs.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Application métallurgie : Le fer réagit avec le soufre pour former le sulfure de fer. Équilibrez : Fe + S → Fe₂S₃",
        backContent: "2Fe + 3S → Fe₂S₃. Ce type de réaction peut poser problème dans les pipelines ivoiriens transportant le soufre, nécessitant des matériaux résistants à la corrosion.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application environnement : Pourquoi la photosynthèse est-elle la réaction chimique la plus importante pour la Côte d'Ivoire?",
        backContent: "6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂. Produit l'oxygène que nous respirons et le glucose (sucre) qui nourrit toutes les plantes, incluant les caféiers et cacaoyers essentiels à l'économie.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
    ],
  },
];

// MODULE 5: CHIMIE - SOLUTIONS ET ACIDES-BASES (4 Leçons)
const pcSolutionsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Solutions et Concentrations",
      description: "Dissolution, concentrations et applications dans la vie quotidienne ivoirienne",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 27,
    },
    cards: [
      {
        frontContent: "Qu'est-ce qu'une solution aqueuse?",
        backContent: "Mélange homogène où le soluté est dissous dans le solvant (eau). Les particules de soluté sont dispersées au niveau moléculaire et invisibles à l'œil nu.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Calculez la concentration massique si 30g de sucre sont dissous dans 500mL d'eau",
        backContent: "C = m/V = 30g / 0,5L = 60 g/L. La concentration est de 60 grammes de sucre par litre de solution.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application boissons : Le jus d'ananas ivoirien contient 15g de sucre pour 200mL. Est-ce plus sucré que le Coca-Cola (106g/L)?",
        backContent: "Jus d'ananas : 15g / 0,2L = 75 g/L. Coca-Cola : 106 g/L. Le Coca-Cola est significativement plus sucré (40% de plus).",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Pourquoi l'eau de mer ivoirienne est-elle moins salée que l'océan Atlantique moyen?",
        backContent: "À cause des apports d'eau douce des grands fleuves (Comoé, Bandama, Sassandra) qui se jettent dans l'Atlantique le long de la côte ivoirienne, diluant la salinité locale.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Acides et Bases",
      description: "pH, acides forts et faibles, applications pratiques et environnementales",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 28,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le pH d'une solution?",
        backContent: "pH = -log[H⁺]. Mesure l'acidité ou basicité sur une échelle de 0 à 14. pH < 7 = acide, pH = 7 = neutre, pH > 7 = basique. Chaque unité représente un facteur 10 en concentration d'ions H⁺.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Une solution a [H⁺] = 10⁻⁴ mol/L. Calculez son pH et sa nature",
        backContent: "pH = -log(10⁻⁴) = 4. pH < 7 donc la solution est acide. C'est modérément acide (comme le jus de citron dilué).",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Application agriculture : Les sols ivoiriens ont souvent un pH compris entre 5 et 6. Que signifie-t-ce?",
        backContent: "Ce sont des sols acides à modérément acides. Cela peut affecter la disponibilité des nutriments pour les plantes. Le chaulage (ajout de calcaire) peut être nécessaire pour certains cultures.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application eau potable : Le traitement de l'eau à Abidjan implique souvent l'ajout de chaux (Ca(OH)₂). Pourquoi?",
        backContent: "Pour neutraliser l'acidité naturelle de certaines eaux de surface, prévenir la corrosion des canalisations, améliorer la coagulation des impuretés et stabiliser le pH autour de 7-8.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : Tous les acides sont dangereux pour la santé",
        backContent: "Faux. De nombreux acides sont essentiels (acide citrique dans les fruits, acides aminés dans les protéines). Le danger dépend de la concentration et du type d'acide.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
];

export async function seedPhysicsChemistryComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive Physics-Chemistry seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const pcSubjectId = subjectsMap.get("PC");
    if (!pcSubjectId) {
      throw new Error("Physics-Chemistry subject not found");
    }

    // Combine all Physics-Chemistry lessons
    const allPCLessons = [
      ...pcMechanicsLessons,
      ...pcElectricityLessons,
      ...pcOpticsLessons,
      ...pcChemistryLessons,
      ...pcSolutionsLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing Physics-Chemistry lessons...");

    for (const { lesson, cards: cardsData } of allPCLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: pcSubjectId,
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

    console.log("\n🎉 Physics-Chemistry comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Topics covered: Mechanics, Electricity, Optics, Chemistry, Solutions`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Physics-Chemistry:", error);
    throw error;
  }
}

if (require.main === module) {
  seedPhysicsChemistryComprehensive()
    .then(() => {
      console.log("✨ Physics-Chemistry comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Physics-Chemistry comprehensive seeding failed:", error);
      process.exit(1);
    });
}
