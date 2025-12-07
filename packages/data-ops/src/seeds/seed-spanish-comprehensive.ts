/**
 * Comprehensive Spanish Seeding Script for Ivorian BEPC/BAC
 * Complete collection of Spanish lessons and flashcards adapted for francophone Ivorian students
 * Focus on practical communication with Latin American context
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
// ESPAGNOL BEPC (3ème) - 20 Leçons
// ============================================================================

// MODULE 1: VERBES ESSENTIELS ET TEMPS (6 Leçons)
const spanishVerbsLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Ser, Estar, Tener: Verbes d'Existence",
      description: "Maîtrise des trois verbes fondamentaux avec exemples pratiques",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "Conjuguez 'ser' au présent de l'indicatif",
        backContent: "Yo soy, tú eres, él/ella/usted es, nosotros somos, vosotros sois, ellos/ellas/ustedes son. Ser caractérise les qualités permanentes.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Quelle est la différence entre 'ser' et 'estar'?",
        backContent: "Ser : état permanent, identité, profession, caractéristiques. Estar : état temporaire, localisation, condition. 'Yo soy estudiante' vs 'Yo estoy en clase'.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Conjuguez 'tener' au présent",
        backContent: "Yo tengo, tú tienes, él/ella/usted tiene, nosotros tenemos, vosotros tenéis, ellos/ellas/ustedes tienen. Tener exprime possession, obligations, caractéristiques.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Choisissez le bon verbe : 'Nosotros _____ (ser) estudiantes de Yamoussoukro'",
        backContent: "somos. Somos = identifier, état permanent d'être étudiants. 'Ser' pour caractéristique permanente.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Complétez : 'María _____ (tener) dos hermanos y _____ (estar) en casa ahora'",
        backContent: "tiene, está. Tiene = possession permanente. Está = localisation temporaire. María possède deux frères (caractéristique permanente) et se trouve dans la maison (localisation actuelle).",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : 'Estoy contento' est incorrect en espagnol",
        backContent: "Faux. 'Estoy contento' est correct. 'Soy contento' serait incorrect car 'contento' est une humeur temporaire. On utilise Estar pour les états d'âme.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 6,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Verbes Irréguliers Importants",
      description: "Verbes irréguliers essentiels : ir, hacer, tener, poder, querer",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "Conjuguez 'ir' au présent de l'indicatif",
        backContent: "Yo voy, tú vas, él/ella/usted va, nosotros vamos, vosotros vais, ellos/ellas/ustedes van. Verbe irrégulier : racine 'v-' sauf 'yo voy', 'él/ella va'.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Conjuguez 'hacer' au passé composé",
        backContent: "Yo he hecho, tú has hecho, él/ella/usted ha hecho, hemos hecho, habéis hecho, ellos/ellas/ustedes han hecho. Hacer + participio passé composé avec l'auxiliaire haber.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Conjuguez 'poder' au conditionnel présent",
        backContent: "Podría, podrías, podría, podríamos, podríais, podrían. Conjugaison irrégulière du radical 'podr-' utilisé pour toutes personnes au conditionnel présent.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application ivoirienne : 'Nous _____ (poder) vendre plus de cacao si les prix augmentent'",
        backContent: "podríamos. 'Podríamos' = 'nous pourrions'. Conditionnel présent : possibilité future. Le sujet 'nous' correspond à 'podríamos'.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Exprimez en espagnol : 'Ils ont fait leurs devoirs'",
        backContent: "Han hecho sus deberes. 'Han' = 'ils ont' (avoir + participe passé), 'hacer' (faire), 'sus' (leurs), 'deberes' (devoirs).",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : 'Yo fui' est le passé composé de 'ir'",
        backContent: "Faux. 'Yo fui' est le passé simple (pretérito indefinido). Le passé composé serait 'he ido'. Note : 'Fui' est le passé simple de 'ir' ET de 'ser'.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 6,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Les Temps Composés et Passé Récent",
      description: "Maîtrise des temps composés et distinction avec le passé récent",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "Comment forme-t-on le passé composé?",
        backContent: "Auxiliaire haber au présent (he, has, ha, hemos, habéis, han) + participe passé. Régulier : participe en -ado/-ido. Irrégulier : formes spéciales (ex: hecho, escrito).",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Quelle est la différence entre passé composé et passé récent?",
        backContent: "Passé récent : action terminée récemment (hoy, ayer), temps clairs spécifiés. Passé composé : action terminée à moment indéfini, ou avec conséquences présentes.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Choisissez : 'Esta mañana yo _____ (hacer) mis deberes' (passé composé vs passé récent)",
        backContent: "he hecho. 'He hecho' = j'ai fait (action terminée avec conséquences présentes). Passé composé convient car 'ce matin' fait partie du présent chronologique.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Mettez au passé récent : 'Ayer yo _____ (comer) en un restaurante ivoirien'",
        backContent: "comí. 'Ayer' indique passé récent (prétérit). 'Comí' = je mangeai/j'ai mangé. 'Ayer comí en un restaurante ivoirien.'",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Application mémoire : 'El año pasado nosotros _____ (viajar) a España'",
        backContent: "viajamos. 'El año pasado' indique moment précis et terminé dans le passé (passé simple/prétérit).",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
      {
        frontContent: "Complétez : 'Ustedes ya _____ (estudiar) español antes de venir en Côte d'Ivoire'",
        backContent: "habían estudiado. 'Ya' indique action terminée avant le moment présent (plus-que-parfait). 'Ya habían estudiado' = vous aviez déjà étudié.",
        cardType: "basic",
        displayOrder: 6,
        points: 25,
      },
    ],
  },
];

// MODULE 2: VOCABULAIRE PRATIQUE (6 Leçons)
const spanishVocabularyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Vocabulaire de la Vie Quotidienne",
      description: "Mots essentiels pour la vie quotidienne en Espagne et Amérique Latine",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 7,
    },
    cards: [
      {
        frontContent: "Que signifie 'buenos días'?",
        backContent: "Bonjour (matin). Utilisé de 6h à midi. 'Buenas tardes' (après-midi), 'buenas noches' (soir). Salutations quotidiennes essentielles.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Qu'est-ce que 'por favor'?",
        backContent: "S'il vous plaît. Pour faire une demande polie. '¿Por favor, puede ayudarme?' = 'Pouvez-vous m'aider, s'il vous plaît?'",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Traduisez 'je veux un café' en espagnol",
        backContent: "Quiero un café. 'Quiero' = je veux, 'un café' = un café. Phrase simple et très utilisée dans les restaurants et cafés.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Comment dit-on 'c'est combien?' en espagnol?",
        backContent: "¿Cuánto cuesta? Ou '¿Cuánto es?' Pour demander le prix. Ex: '¿Cuánto cuesta este libro?' = 'Combien coûte ce livre?'",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Qu'est-ce que 'gracias'?",
        backContent: "Merci. Utilisé pour remercier. 'Gracias por tu ayuda' = Merci pour ton aide. 'Muchas gracias' = Merci beaucoup.",
        cardType: "basic",
        displayOrder: 5,
        points: 15,
      },
      {
        frontContent: "Vrai ou Faux : 'Lo siento' signifie 'je sens bien'",
        backContent: "Faux. 'Lo siento' = je suis désolé. 'Me siento bien' = je me sens bien (état physique/émotionnel).",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 6,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Nombres et Heures",
      description: "Compter, donner l'heure et expressions temporelles",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 8,
    },
    cards: [
      {
        frontContent: "Comptez de 1 à 10 en espagnol",
        backContent: "Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez. Chiffres espagnols différents du français à partir de six.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "Comment dire 15h45 en espagnol?",
        backContent: "Son las cuatro menos cuarto. Ou 'Son las tres y cuarenta y cinco'. L'expression traditionnelle utilise 'menos cuarto' (moins le quart).",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Qu'est-ce que 'mañana'?",
        backContent: "Demain (ou 'matin' selon le contexte: 'la mañana'). 'Hoy' = aujourd'hui, 'ayer' = hier. 'Anteayer' = avant-hier.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Application scolaire : 'Las clases empiezan a las _____ (seis) de la mañana'",
        backContent: "seis. Les classes commencent à six heures du matin. 'Seis' = 6 en espagnol.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Express 'quarter past seven' en espagnol",
        backContent: "Son las siete y cuarto. Les Espagnols disent 'y cuarto' pour quart (15 minutes). 'Son las siete y cuarto' = 7h15.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : 'Diez y media' signifie 10h05",
        backContent: "Faux. 'Diez y media' signifie 10h30. 'Diez y cinco' = 10h05. 'Media' signifie demi/moitié.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 6,
        points: 15,
      },
    ],
  },
];

// MODULE 3: COMMUNICATION ET CONVERSATION (5 Leçons)
const spanishCommunicationLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Conversation de Base",
      description: "Dialogues pratiques pour la vie quotidienne et situations sociales",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 13,
    },
    cards: [
      {
        frontContent: "Présentez-vous en espagnol",
        backContent: "Me llamo [votre nom] y soy [votre nationalité]. Soy estudiante de [votre école]. Vivo en [votre ville]. Tengo [âge] años.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Demandez des informations sur les études d'une personne",
        backContent: "¿Qué estudias? ¿Dónde estudias? ¿En qué año estás? ¿Qué te gusta estudiar más?",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Question : '¿Te gusta la comida española?' Réponse typique : 'Sí, me encanta la paella'",
        backContent: "La paella est un plat espagnol très populaire. Réponse positive commence par 'Sí, me encanta/Me gusta mucho'. Négative : 'No me gusta'.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Comment demande 'Où se trouve la bibliothèque?'",
        backContent: "¿Dónde está la biblioteca? Pour un lieu : '¿Dónde está el supermercado?' Pour une personne : '¿Dónde está María?'",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Vrai ou Faux : '¿Cuántos años tienes?' est l'unique façon de demander l'âge",
        backContent: "Faux. Autres options : '¿Qué edad tienes?'. Mais '¿Cuántos años tienes?' est la plus courante.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
];

// ============================================================================
// ESPAGNOL TERMINALE BAC - TOUTES SÉRIES (8 Leçons)
// ============================================================================

// MODULE 1: GRAMMAIRE AVANCÉE (5 Leçons)
const spanishAdvancedGrammarLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Le Subjonctif",
      description: "Le subjonctif présent, imparfait et ses applications académiques",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 18,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le subjonctif?",
        backContent: "Mode verbal qui exprime subjectivité, désir, hypothèse, ordre. Utilisé après 'que', 'como si', 'para que', verbes de volonté (querer, desear, preferir).",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Conjuguez 'estudiar' au subjonctif présent",
        backContent: "Estudie, estudies, estudie, estudiemos, estudiéis, estudien. Verbe régulier en -ar : la terminaison 'a' de l'indicatif devient 'e' au subjonctif.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "Quelle est la différence entre subjonctif présent et imparfait?",
        backContent: "Présent : hypothèse, obligation, souhait actuel. Imparfait : condition passée, ou concordance des temps avec un verbe principal au passé. Ex: 'Quiero que estudies' vs 'Quería que estudiaras'.",
        cardType: "basic",
        displayOrder: 3,
        points: 30,
      },
      {
        frontContent: "Application académique : 'Es importante que los estudiantes _____ (estudiar) todos los días'",
        backContent: "estudien. Subjonctif présent exprimant obligation/conseil impersonnel. 'Il est important que les étudiants étudient'.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Mettez au subjonctif imparfait : 'Cuando era niño, mi madre quería que yo _____ (jugar) al fútbol'",
        backContent: "jugara (ou jugase). Concordance des temps : le verbe principal 'quería' est au passé, donc le subordonné est au subjonctif imparfait.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
      {
        frontContent: "Vrai ou Faux : 'Quisiera' est utilisé pour la politesse",
        backContent: "Vrai. 'Quisiera' est l'imparfait du subjonctif de 'querer', utilisé couramment pour exprimer un souhait poli ('Je voudrais'), remplaçant le conditionnel.",
        cardType: "true_false",
        correctAnswer: "true",
        displayOrder: 6,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Participes Passés Composés",
      description: "Participes passés complexes et différence avec le passé simple",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 19,
    },
    cards: [
      {
        frontContent: "Qu'est-ce que le participe passé?",
        backContent: "Forme verbale utilisée dans les temps composés (passé composé, plus-que-parfait) et comme adjectif. Se termine en -ado (verbes en AR) ou -ido (ER/IR).",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "Comment se forme le participe passé de 'escribir'?",
        backContent: "Escribir → escrito. C'est un participe irrégulier. 'He escrito una carta' (J'ai écrit une lettre).",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Conjuguez 'ser' au plus-que-parfait",
        backContent: "Había sido, habías sido, había sido, habíamos sido, habíais sido, habían sido. Auxiliaire haber à l'imparfait + participe passé 'sido'.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Application littéraire: 'El libro ya _____ (ser) traducido a cinco idiomas'",
        backContent: "ha sido (ou había sido). Forme passive : 'ser' + participe passé. 'Le livre a déjà été traduit'.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Quelle est la différence entre participe passé et gérondif?",
        backContent: "Participe passé : temps composés/adjectif (ex: comido, cerrado). Gérondif : action en cours (ex: comiendo, cerrando). 'Estoy comiendo' (Je suis en train de manger).",
        cardType: "basic",
        displayOrder: 5,
        points: 30,
      },
    ],
  },
];

export async function seedSpanishComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive Spanish seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const spanishSubjectId = subjectsMap.get("ESP");
    if (!spanishSubjectId) {
      throw new Error("Spanish subject not found");
    }

    // Combine all Spanish lessons
    const allSpanishLessons = [
      ...spanishVerbsLessons,
      ...spanishVocabularyLessons,
      ...spanishCommunicationLessons,
      ...spanishAdvancedGrammarLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing Spanish lessons...");

    for (const { lesson, cards: cardsData } of allSpanishLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: spanishSubjectId,
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

    console.log("\n🎉 Spanish comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Focus: Practical communication for Latin American context`);
    console.log(`   - Levels: BEPC preparation and BAC advanced grammar`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive Spanish:", error);
    throw error;
  }
}

if (require.main === module) {
  seedSpanishComprehensive()
    .then(() => {
      console.log("✨ Spanish comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Spanish comprehensive seeding failed:", error);
      process.exit(1);
    });
}
