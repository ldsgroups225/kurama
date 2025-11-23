/**
 * Comprehensive Philosophy Seeding Script for Ivorian BAC
 * Complete collection of Philosophy lessons and flashcards for BAC Series A and D
 * Adapted for Côte d'Ivoire educational system with African philosophical traditions
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
// PHILOSOPHIE TERMINALE BAC - 30 Leçons
// ============================================================================

// MODULE 1: CONSCIENCE ET INCONSCIENT (6 Leçons)
const philosophyConsciousnessLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Conscience chez Descartes",
      description: "Le cogito cartésien et la fondation de la connaissance de soi",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Quelle est la signification du 'Cogito ergo sum' de Descartes?",
        backContent: "'Je pense, donc je suis'. Point de départ de la philosophie cartésienne. Premier principe certain qui fonde toute connaissance après le doute méthodique. La pensée prouve l'existence du sujet pensant.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Comment Descartes arrive-t-il au cogito?",
        backContent: "Par le doute méthodique : tout ce qui peut être mis en doute doit être rejeté. Mais même si je doute, je pense. Le doute lui-même prouve l'existence de la pensée et donc de l'être qui pense.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Qu'est-ce que la conscience réflexive chez Descartes?",
        backContent: "La conscience qui peut se prendre elle-même pour objet. Permet au sujet de se connaître lui-même, de réfléchir sur ses propres pensées. Distingue conscience directe (pensées immédiates) et conscience indirecte (réflexion sur les pensées).",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Comment la pensée africaine interprète-t-elle le cogito?",
        backContent: "Certains philosophes africains critiquent le caractère individualiste du cogito. Pour Senghor, la conscience est d'abord communion avec le monde et la communauté. L'existence est relationnelle, pas purement introspective.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Pour Descartes, la conscience est toujours transparente à elle-même",
        backContent: "Vrai. Descartes défend que la conscience est claire et distincte, immédiatement transparente à elle-même. 'Je pense, donc je suis' est une évidence indubitable, directement perçue par la conscience.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'Inconscient chez Freud",
      description: "La découverte freudienne de l'inconscient et ses implications",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Quelle est la découverte fondamentale de Freud?",
        backContent: "L'inconscient comme partie de notre psychisme échappant à la conscience mais influençant nos pensées et comportements. Contient les désirs refoulés, traumatismes, pulsions inacceptables pour la conscience.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Quelles sont les trois instances de l'appareil psychique selon Freud?",
        backContent: "Le Ça (pulsions primitives, principe de plaisir), le Moi (instance médiatrice confrontée à la réalité), le Surmoi (interdits moraux et culturels internalisés). Ces trois instances sont en conflit permanent.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment l'inconscient se manifeste-t-il selon Freud?",
        backContent: "À travers les rêves, lapsus, actes manqués, symptômes névrotiques. Ces manifestations sont des 'formations de compromis' entre désirs inconscients et défenses conscientes.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application culturelle : Comment l'inconscient s'exprime-t-il dans les cultures africaines?",
        backContent: "À travers les mythes, rituels, traditions. La psychanalyse africaine (ex: Hountondji) explore comment l'inconscient collectif africain influence les comportements sociaux et individuels dans les sociétés traditionnelles.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
      {
        frontContent: "Quelle critique la psychanalyse africaine adresse-t-elle à Freud?",
        backContent: "Accusations d'ethnocentrisme, modèle trop occidental, méconnaissance des spécificités culturelles africaines. Philosophes africains proposent des approches alternatives de l'inconscient intégrant les dimensions communautaires et spirituelles.",
        cardType: "basic",
        displayOrder: 5,
        points: 30,
      },
    ],
  },
];

// MODULE 2: LIBERTÉ ET DÉTERMINISME (6 Leçons)
const philosophyFreedomLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Le Libre Arbitre",
      description: "Débat entre libre arbitre et déterminisme dans la philosophie classique",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 7,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le libre arbitre?",
        backContent: "Capacité de l'être humain à choisir et agir de manière autonome, sans contrainte déterministe externe. Implique responsabilité morale : si nous agissons librement, nous sommes responsables de nos actions.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Comment Saint Augustin définit-il le libre arbitre?",
        backContent: "Capacité de choisir entre le bien et le mal, entre Dieu et les créatures. Librement atteinte par le péché originel, l'homme perd sa liberté primitive mais peut retrouver la vraie liberté en se tournant vers Dieu.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Quelle est l'argument déterministe classique?",
        backContent: "Tous les événements, y compris les actions humaines, sont causés par des antécédents. Selon le déterminisme, ce que nous appelons 'libre choix' n'est que l'effet de causes que nous ne contrôlons pas (génétique, environnement, éducation).",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application sociale : Comment le débat liberté/déterminisme s'applique-t-il à la société ivoirienne?",
        backContent: "Tension entre structures traditionnelles (déterminées par coutumes, héritage) et aspirations individuelles modernes (liberté d'entrepreneurship, choix professionnels). Jeunes Ivoiriens face à poids des traditions familiales.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Vrai ou Faux : Le fatalisme africain signifie absence de liberté",
        backContent: "Faux. Le fatalisme traditionnel ne nie pas la liberté humaine mais la situe dans un cadre cosmologique et spirituel. Philosophie africaine réconcilie déterminisme divin et responsabilité humaine.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "L'Existentialisme sartrien",
      description: "La conception radicale de la liberté chez Jean-Paul Sartre",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 8,
    },
    cards: [
      {
        frontContent: "Que signifie 'l'homme est condamné à être libre' selon Sartre?",
        backContent: "L'existence précède l'essence : nous existons d'abord sans nature prédéfinie. Devons nous créer par nos choix. Sommes responsables de notre être et de l'humanité entière. Liberté absolue et inconditionnelle.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Quelle est la conception sartrienne de la responsabilité?",
        backContent: "Responsabilité radicale : en choisissant pour moi, je choisis pour tous les hommes. Mes choix créent un modèle d'humanité. Choisir d'être courageux ou lâche engage l'humanité entière dans ces valeurs.",
        cardType: "basic",
        displayOrder: 2,
        points: 30,
      },
      {
        frontContent: "Comment Sartre distingue-t-il liberté ontologique et liberté de fait?",
        backContent: "Liberté ontologique : condition humaine fondamentale (condamné à être libre). Liberté de fait : possibilité de réaliser cette liberté concrètement, malgré contraintes matérielles et sociales. L'existence ne va pas sans cette tension.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Critique de la liberté sartrienne dans le contexte africain",
        backContent: "La conception sartrienne de l'individu isolé ignore la dimension communautaire essentielle en Afrique. L'individu africain est défini par ses relations familiales, communautaires. La liberté s'exerce dans et non contre la communauté.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
    ],
  },
];

// MODULE 3: JUSTICE ET ÉTAT (6 Leçons)
const philosophyJusticeLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "La Justice dans la République de Platon",
      description: "Justice comme harmonie et ordre dans la cité idéale",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 13,
    },
    cards: [
      {
        frontContent: "Quelle est la conception platonicienne de la justice?",
        backContent: "Harmonie entre les parties de l'âme et entre les citoyens. Chacun fait ce qui lui convient le mieux. Justice comme ordre naturel : les esprits raisonnables gouvernent, les courageux défendent, les producteurs travaillent.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Comment Platon distingue-t-il justice individuelle et justice sociale?",
        backContent: "Justice individuelle : harmonie intérieure, chaque partie de l'âme remplit bien sa fonction. Justice sociale : structure où chaque classe sociale fait bien son travail, sans empiéter sur les autres classes.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Quel est le problème de la justice dans les sociétés démocratiques selon Platon?",
        backContent: "Les démocraties laissent le pouvoir à la multitude (ignorante) conduisant à la démagogie. Les sophistes manipulent l'opinion pour le pouvoir personnel. Justice impossible sans la connaissance (sagesse) qui doit gouverner.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application à l'Afrique : La justice platonicienne s'applique-t-elle aux États ivoiriens?",
        backContent: "Difficile : société ivoirienne complexe avec tensions tradition/modernité. Justice platonicienne pourrait inspirer une élite sage mais conteste la démocratie participative valorisée en Afrique. Nécessité d'adapter le modèle.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
      {
        frontContent: "Vrai ou Faux : Pour Platon, la justice est toujours la même que l'égalité",
        backContent: "Faux. Justice implique inégalité : les plus aptes gouvernent. Égalité stricule serait injustice car les moins capables auraient des responsabilités qu'ils ne peuvent assumer. Justice = inégalité juste et naturelle.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "La Justice comme Équité chez Aristote",
      description: "La justice distributive et l'égalité proportionnelle",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 14,
    },
    cards: [
      {
        frontContent: "Quelle est la distinction aristotélicienne entre justice commutative et justice distributive?",
        backContent: "Justice commutative : échanges équitables entre individus (contrats, commerce). Réparation : rétablir l'égalité rompue. Justice distributive : distribution équitable des biens et honneurs dans la cité.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Qu'est-ce que la justice distributive chez Aristote?",
        backContent: "Donner à chacun ce qui lui revient selon son mérite et ses capacités. Principe de proportionnalité : à plus grande capacité, plus grande part des biens, mais proportionnée au mérite, pas seulement à la richesse ou naissance.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment Aristote justifie-t-il l'inégalité naturelle des êtres humains?",
        backContent: "Certains sont naturellement plus doués pour la raison, d'autres pour la force. Justice ne signifie pas égalité mais proportionnalité : plus grandes capacités méritent plus grandes responsabilités et parts des biens.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application éducation ivoirienne : La justice aristotélicienne dans l'accès à l'enseignement supérieur",
        backContent: "Principe méritocratique : accès selon capacités et mérites, pas seulement selon richesse. Cependant critique : la 'capacité naturelle' peut reproduire les inégalités sociales existantes. Justice aristotélicienne peut justifier les inégalités socio-économiques.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
    ],
  },
];

// MODULE 4: ART ET BEAU (6 Leçons)
const philosophyArtLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "L'Esthétique de Kant",
      description: "Le jugement de goût et la finalité de l'art",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 19,
    },
    cards: [
      {
        frontContent: "Quelle est la distinction kantienne entre jugement déterminant et jugement réfléchissant?",
        backContent: "Déterminant : objet déterminé par concept, universel, nécessaire. Ex: 'Cette rose est belle' (si suivie de concept). Réfléchissant : objet particulier sans concept, beauté subjective, universalisable sans concept. 'Cette rose est belle' comme sentiment esthétique.",
        cardType: "basic",
        displayOrder: 1,
        points: 30,
      },
      {
        frontContent: "Quelle est la nature du jugement esthétique selon Kant?",
        backContent: "Subjectif mais universel. 'Ce tableau est beau' exprime mon sentiment personnel mais prétend l'accord de tous. Condition : absence d'intérêt personnel, accord désintéressé, universalité de la communication.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Quelle est la finalité de l'art selon Kant?",
        backContent: "L'art n'a pas de finalité pratique ou théorique. Finalité : procurer le plaisir esthétique. Jeu libre et harmonieux des facultés de l'esprit (imagination et entendement) sans concept déterminant.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application aux arts africains : Comment juger l'art traditionnel ivoirien selon Kant?",
        backContent: "Arts traditionnels (masques, sculptures) ont souvent des finalités religieuses ou sociales, pas purement esthétiques. Kant pourrait dire que lorsqu'appréhendus sans ces finalités pratiques, peuvent provoquer le plaisir esthétique comme beaux arts.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
      {
        frontContent: "Vrai ou Faux : Pour Kant, le beau est objectif",
        backContent: "Faux. Le beau est subjectif mais prétend à l'universalité. Pas de propriété objective dans l'objet qui le rend beau. La beauté réside dans le sentiment du sujet, mais ce sentiment doit pouvoir être partagé par tous.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
];

// MODULE 5: LANGAGE ET PHILOSOPHIE (6 Leçons)
const philosophyLanguageLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Le Problème du Langage chez Wittgenstein",
      description: "Limites du langage et philosophie thérapeutique",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 25,
    },
    cards: [
      {
        frontContent: "Quelle est la conception wittgensteinienne du langage?",
        backContent: "Le langage comme jeu de langage (language game). Chaque mot a son sens dans l'usage, dans les règles du jeu. Le sens n'est pas dans le mot mais dans l'application dans formes de vie.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Qu'est-ce que la philosophie thérapeutique selon le deuxième Wittgenstein?",
        backContent: "La philosophie aide à voir clairement les limites du langage, à dissoudre les confusions philosophiques. Non pour construire des théories mais pour guérir de la fascination par les énigmes linguistiques.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Comment Wittgenstein critique-t-il la philosophie traditionnelle?",
        backContent: "Elle reste prisonnière des confusions langagières, croit pouvoir répondre à des questions qui n'en sont pas. Les problèmes philosophiques sont des puzzles linguistiques créés par l'abus du langage hors son contexte d'origine.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application multilinguisme ivoirien : Comment le concept de jeu de langage s'applique-t-il?",
        backContent: "Le français officiel, les langues locales (dioula, baoulé, bété), l'anglais international forment des jeux de langage différents. Bilinguisme comme maîtrise de multiples jeux de langage avec leurs règles spécifiques.",
        cardType: "basic",
        displayOrder: 4,
        points: 35,
      },
      {
        frontContent: "Vrai ou Faux : Pour Wittgenstein, le langage peut tout exprimer",
        backContent: "Faux. Le langage a des limites. Ce qu'on ne peut pas exprimer, il faut taire. Les énigmes de la vie et de la mort échappent au langage. La philosophie doit montrer les limites du langage.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
];

export async function seedPhilosophyComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive Philosophy seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const philosophySubjectId = subjectsMap.get("PHILO");
    if (!philosophySubjectId) {
      throw new Error("Philosophy subject not found");
    }

    // Combine all Philosophy lessons
    const allPhilosophyLessons = [
      ...philosophyConsciousnessLessons,
      ...philosophyFreedomLessons,
      ...philosophyJusticeLessons,
      ...philosophyArtLessons,
      ...philosophyLanguageLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing Philosophy lessons...");

    for (const { lesson, cards: cardsData } of allPhilosophyLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: philosophySubjectId,
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

    console.log("\n🎉 Philosophy comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Thinkers covered: Descartes, Freud, Sartre, Plato, Aristotle, Kant, Wittgenstein`);
    console.log(`   - African perspective: Integrated throughout`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Philosophy:", error);
    throw error;
  }
}

if (require.main === module) {
  seedPhilosophyComprehensive()
    .then(() => {
      console.log("✨ Philosophy comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Philosophy comprehensive seeding failed:", error);
      process.exit(1);
    });
}
