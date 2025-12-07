/**
 * Comprehensive English Language Seeding Script for Ivorian BEPC/BAC
 * Complete collection of English lessons and flashcards adapted for francophone Ivorian students
 * Focus on practical communication and BEPC/BAC exam preparation
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
// ENGLISH BEPC (3ème) - 25 Leçons
// ============================================================================

// MODULE 1: GRAMMAR FUNDAMENTALS (8 Leçons)
const englishGrammarLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Present Simple vs Present Continuous",
      description: "Mastering present tenses with examples from Ivorian daily life",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 1,
    },
    cards: [
      {
        frontContent: "When do we use Present Simple?",
        backContent: "For habits, routines, permanent situations, and general truths. Example: 'I study at Lycée Classique d'Abidjan.' 'The sun rises in the east.' Uses frequency adverbs: always, usually, often, sometimes.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "When do we use Present Continuous?",
        backContent: "For actions happening now, temporary situations, and future arrangements. Example: 'I am studying for my exams.' 'It is raining in Yamoussoukro right now.' Form: am/is/are + verb-ing.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Choose the correct form: 'The students _____ (listen) to the teacher now'",
        backContent: "are listening. Present Continuous for action happening now. The students are currently in the classroom listening to the teacher.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Fill the blank: 'Cocoa farmers _____ (work) hard every day in Côte d'Ivoire'",
        backContent: "work. Present Simple for daily routine or habit. Cocoa farming is a regular activity for Ivorian farmers.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "True or False: 'She is knowing the answer' is correct English",
        backContent: "False. Know is a stative verb (state verb) that we don't use in continuous tense. Correct: 'She knows the answer.' Other stative verbs: love, hate, understand, believe, own.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
  {
    lesson: {
      title: "Past Tenses: Simple Past vs Present Perfect",
      description: "Understanding the crucial difference with Ivorian context examples",
      difficulty: "hard",
      estimatedDuration: 60,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 2,
    },
    cards: [
      {
        frontContent: "When do we use Simple Past?",
        backContent: "For completed actions at a specific time in the past. Often uses time expressions: yesterday, last week, in 1990, two days ago. Example: 'I visited Abidjan last year.'",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "When do we use Present Perfect?",
        backContent: "For actions with present connection: life experience, news, unfinished time periods. Often uses: ever, never, yet, already, since, for. Example: 'I have been to Yamoussoukro three times.'",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "Choose the correct form: 'I _____ (visit) the National Museum of Abidjan last month'",
        backContent: "visited. Simple Past because of specific time reference 'last month'. The visit is completed in the past.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Fill the blank: 'She _____ (never/try) attiéké before coming to Côte d'Ivoire'",
        backContent: "has never tried. Present Perfect for life experience up to now. The experience (or lack thereof) continues to the present moment.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "Explain the difference: 'I lost my phone yesterday' vs 'I have lost my phone'",
        backContent: "'I lost my phone yesterday' = specific past time, action completed, maybe found since. 'I have lost my phone' = unsolved present problem, I don't have it now, time not specified.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Articles: A/An/The/No Article",
      description: "Mastering articles with common mistakes for French speakers",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 3,
    },
    cards: [
      {
        frontContent: "When do we use 'a' vs 'an'?",
        backContent: "'An' before vowel sounds (a, e, i, o, u): an apple, an hour, an MBA. 'A' before consonant sounds: a university, a book, a car. It's about the sound, not the letter.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "When do we use 'the'?",
        backContent: "For specific items, unique items, previously mentioned items, superlatives: 'The President of Côte d'Ivoire', 'The sun', 'I bought a phone and the phone is blue'.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "Choose the correct article: 'She works as _____ architect in Abidjan'",
        backContent: "an. 'Architect' starts with vowel sound /ɑːr/. This is a common mistake for French speakers who focus on the spelling.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Why don't we use articles with countries but use with 'United States' or 'United Kingdom'?",
        backContent: "No articles with most countries: Côte d'Ivoire, France, China. But we use 'the' with countries that are states, unions, or plural: the United States, the United Kingdom, the Philippines.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "Fill in: '_____ cocoa is main export of _____ Côte d'Ivoire'",
        backContent: "The, Ø. 'The cocoa' (specific commodity) but 'Côte d'Ivoire' (no article with country name).",
        cardType: "basic",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
];

// MODULE 2: VOCABULARY IN CONTEXT (6 Leçons)
const englishVocabularyLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Business and Economic Vocabulary",
      description: "Essential business terms for Côte d'Ivoire's economy",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 9,
    },
    cards: [
      {
        frontContent: "What does 'commodity' mean in economics?",
        backContent: "A basic raw material or primary agricultural product that can be bought and sold. Examples: cocoa, coffee, oil, gold. Côte d'Ivoire's main commodities are cocoa and coffee.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Define 'supply chain'",
        backContent: "The entire network of entities, people, activities, information, and resources involved in moving a product or service from supplier to customer. Cocoa supply chain in Côte d'Ivoire: farmer → cooperative → exporter → processor → consumer.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "What does 'GDP' stand for and mean?",
        backContent: "Gross Domestic Product. Total value of all goods and services produced within a country in one year. Côte d'Ivoire's GDP has been growing due to agriculture and services sectors.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "Explain 'trade balance'",
        backContent: "Difference between a country's exports and imports. Positive (surplus): exports > imports. Negative (deficit): imports > exports. Côte d'Ivoire generally has a positive trade balance due to cocoa exports.",
        cardType: "basic",
        displayOrder: 4,
        points: 25,
      },
      {
        frontContent: "True or False: 'Revenue' and 'profit' mean the same thing",
        backContent: "False. Revenue = total money received from sales (turnover). Profit = revenue - expenses. A company can have high revenue but zero profit if expenses equal revenue.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 20,
      },
    ],
  },
  {
    lesson: {
      title: "Education and School Vocabulary",
      description: "Essential terms for Ivorian education system and university",
      difficulty: "easy",
      estimatedDuration: 45,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 10,
    },
    cards: [
      {
        frontContent: "What is the difference between 'undergraduate' and 'graduate' studies?",
        backContent: "Undergraduate: Bachelor's degree (3-4 years). Graduate: Master's degree, PhD, or other postgraduate studies. 'I'm doing my undergraduate studies at University of Cocody.'",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "Define 'curriculum'",
        backContent: "The subjects comprising a course of study in a school or college. Ivorian curriculum includes subjects like Mathematics, French, English, Physics, Chemistry, etc.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "What does 'scholarship' mean?",
        backContent: "Financial aid for a student to pursue education. Can be based on academic merit, financial need, or other criteria. Many Ivorian students receive scholarships to study abroad.",
        cardType: "basic",
        displayOrder: 3,
        points: 15,
      },
      {
        frontContent: "Explain 'academic year'",
        backContent: "The period of time during which a school, college, or university holds classes. In Côte d'Ivoire, typically September to June. Divided into terms or semesters.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
      {
        frontContent: "What is 'tuition'?",
        backContent: "Money paid for instruction at a school, college, or university. Public universities in Côte d'Ivoire have lower tuition than private institutions.",
        cardType: "basic",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
];

// MODULE 3: READING COMPREHENSION (5 Leçons)
const englishReadingLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Reading Strategies and Techniques",
      description: "Effective reading methods for BEPC exam passages",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 15,
    },
    cards: [
      {
        frontContent: "What is the SQ3R reading method?",
        backContent: "Survey, Question, Read, Recite, Review. A systematic approach to reading textbooks: Survey (skim), Question (what do you want to learn), Read (actively), Recite (summarize), Review (strengthen memory).",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "What is 'skimming'?",
        backContent: "Reading quickly to get the main idea or gist. Look at headings, first sentences of paragraphs, conclusion. Useful for understanding a passage before detailed reading.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "How does 'scanning' differ from 'skimming'?",
        backContent: "Scanning: reading quickly to find specific information (a name, date, statistic). Skimming: reading quickly to understand the main idea. Scanning searches for details, skimming for general understanding.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "What is 'context clue'?",
        backContent: "Information from surrounding text that helps understand the meaning of an unknown word. Example: 'The farmer was jubilant when he harvested his first cocoa crop' - jubilant means very happy.",
        cardType: "basic",
        displayOrder: 4,
        points: 15,
      },
      {
        frontContent: "True or False: You should understand every word to understand a text",
        backContent: "False. Good readers can understand the main idea without knowing every word. Use context clues or skip unknown words that don't affect understanding.",
        cardType: "true_false",
        correctAnswer: "false",
        displayOrder: 5,
        points: 15,
      },
    ],
  },
];

// MODULE 4: LISTENING AND SPEAKING (6 Leçons)
const englishListeningLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Understanding Different Accents",
      description: "Preparing for various English accents in listening comprehension",
      difficulty: "medium",
      estimatedDuration: 50,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 20,
    },
    cards: [
      {
        frontContent: "What are the main English accents you might hear in exams?",
        backContent: "British English (RP), American English (General American), sometimes Australian or Canadian. BEPC usually uses standard British pronunciation.",
        cardType: "basic",
        displayOrder: 1,
        points: 15,
      },
      {
        frontContent: "How does American 'r' sound differ from British 'r'?",
        backContent: "American: pronounced 'r' in all positions (car, bird, teacher). British: pronounced only before vowels, not after vowels (car, bird) but silent in 'teacher' (British 'teacha').",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "What is the difference in 'schedule' pronunciation?",
        backContent: "British: /ˈʃedjuːl/ (shedule). American: /ˈskedʒuːl/ (skedule). This is one of many pronunciation differences between British and American English.",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "How can you practice understanding different accents?",
        backContent: "Listen to BBC (British), CNN (American), watch movies from different countries, use pronunciation apps, listen to news from various English-speaking countries, practice with international friends.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "What is 'connected speech'?",
        backContent: "The way sounds change in connected speech (word linking, reduction, assimilation). Example: 'I am going to' becomes 'I'm gonna' in casual speech. Understanding this helps listening comprehension.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
  {
    lesson: {
      title: "Oral Communication Skills",
      description: "Speaking fluently about Ivorian topics and daily life",
      difficulty: "medium",
      estimatedDuration: 55,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 21,
    },
    cards: [
      {
        frontContent: "How can you describe your hometown in English?",
        backContent: "Use descriptive language: 'I live in Abidjan, the economic capital of Côte d'Ivoire. It's a vibrant coastal city with modern buildings and traditional markets. The weather is tropical and humid year-round.'",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "What phrases can help you gain thinking time when speaking?",
        backContent: "Fillers: 'Well...', 'Let me think...', 'That's an interesting question...', 'In my opinion...', 'To be honest...', 'As far as I know...'. These give you time to formulate your response.",
        cardType: "basic",
        displayOrder: 2,
        points: 15,
      },
      {
        frontContent: "How can you talk about Ivorian food in English?",
        backContent: "Use specific vocabulary: 'Attieké is a traditional Ivorian dish made from cassava. Alloco is fried plantain. Garba is couscous made from fermented cassava. These dishes are staples in Ivorian cuisine.'",
        cardType: "basic",
        displayOrder: 3,
        points: 20,
      },
      {
        frontContent: "What is 'paraphrasing' and why is it important?",
        backContent: "Expressing the same meaning in different words. Important because: shows understanding, avoids plagiarism, demonstrates language range, helps communicate more clearly. Example: 'He succeeded' → 'He achieved his goals'.",
        cardType: "basic",
        displayOrder: 4,
        points: 20,
      },
      {
        frontContent: "How can you improve your speaking fluency?",
        backContent: "Practice regularly with native speakers, record yourself and listen back, learn common phrases and expressions, speak about topics you know well, focus on communication over perfection, use songs and movies to learn natural flow.",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
];

// ============================================================================
// ENGLISH TERMINALE BAC - ALL SERIES (8 Leçons)
// ============================================================================

// MODULE 1: ADVANCED GRAMMAR AND WRITING (5 Leçons)
const englishAdvancedLessons: LessonWithCards[] = [
  {
    lesson: {
      title: "Conditionals and Hypothetical Situations",
      description: "Mastering all conditional types for BAC exam writing",
      difficulty: "hard",
      estimatedDuration: 65,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 26,
    },
    cards: [
      {
        frontContent: "What is the structure of First Conditional?",
        backContent: "If + present simple, will + base verb. Use for real, likely future situations. Example: 'If I study hard, I will pass the BAC exam.' Also: can, may, might + base verb instead of will.",
        cardType: "basic",
        displayOrder: 1,
        points: 20,
      },
      {
        frontContent: "How does Second Conditional differ from First?",
        backContent: "Second: If + past simple, would + base verb. Use for unreal/hypothetical situations in present/future. 'If I had more money, I would buy a car.' First is likely future, Second is unlikely/impossible.",
        cardType: "basic",
        displayOrder: 2,
        points: 25,
      },
      {
        frontContent: "What is Third Conditional used for?",
        backContent: "If + past perfect, would have + past participle. Use for unreal situations in the past (regrets, imagining different past). Example: 'If I had studied harder, I would have passed the exam.'",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "Complete: 'If Côte d'Ivoire _____ (have) more industries, unemployment _____ (be) lower'",
        backContent: "had, would be. Second Conditional for hypothetical present situation with imaginary condition in past. Use 'had' (past perfect) and 'would be' (conditional).",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "Create a sentence about Ivorian development using Mixed Conditional",
        backContent: "If I had studied agriculture at university, I would be working to improve cocoa production now.' (Past condition + present result) or 'If I had started earlier, I would be more successful by now.'",
        cardType: "basic",
        displayOrder: 5,
        points: 35,
      },
    ],
  },
  {
    lesson: {
      title: "Advanced Essay Writing Techniques",
      description: "Sophisticated writing structures for BAC composition",
      difficulty: "hard",
      estimatedDuration: 70,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      displayOrder: 27,
    },
    cards: [
      {
        frontContent: "What is the structure of a 5-paragraph essay?",
        backContent: "Introduction (thesis + 3 points), Body 1 (point 1 + evidence), Body 2 (point 2 + evidence), Body 3 (point 3 + evidence), Conclusion (restatement, final thought). Each paragraph ~4-6 sentences.",
        cardType: "basic",
        displayOrder: 1,
        points: 25,
      },
      {
        frontContent: "How can you improve essay vocabulary for BAC?",
        backContent: "Use sophisticated vocabulary: 'significant' instead of 'big', 'numerous' instead of 'many', 'consequently' instead of 'so', 'nevertheless' instead of 'but'. Use academic transition words: 'furthermore', 'moreover', 'conversely'.",
        cardType: "basic",
        displayOrder: 2,
        points: 20,
      },
      {
        frontContent: "What are 'sentence variety' techniques?",
        backContent: "Mix different sentence structures: simple (I study English), compound (I study English and I practice daily), complex (Although it's difficult, I practice daily). Vary sentence length and start words.",
        cardType: "basic",
        displayOrder: 3,
        points: 25,
      },
      {
        frontContent: "How can you write about 'Development in Côte d'Ivoire' at BAC level?",
        backContent: "Introduction: Thesis about development progress. Body 1: Economic development (GDP, agriculture, industry). Body 2: Social development (education, healthcare, infrastructure). Body 3: Challenges and future prospects. Conclusion: Balanced summary with personal perspective.",
        cardType: "basic",
        displayOrder: 4,
        points: 30,
      },
      {
        frontContent: "What makes a conclusion effective?",
        backContent: "Restates thesis without repetition, summarizes main points, provides final insight or call to action, avoids introducing new information, leaves strong impression. Should not simply say 'In conclusion...'",
        cardType: "basic",
        displayOrder: 5,
        points: 25,
      },
    ],
  },
];

export async function seedEnglishComprehensive() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting comprehensive English seeding...");

  try {
    const allSubjects = await db.query.subjects.findMany();
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const englishSubjectId = subjectsMap.get("ANG");
    if (!englishSubjectId) {
      throw new Error("English subject not found");
    }

    // Combine all English lessons
    const allEnglishLessons = [
      ...englishGrammarLessons,
      ...englishVocabularyLessons,
      ...englishReadingLessons,
      ...englishListeningLessons,
      ...englishAdvancedLessons,
    ];

    let totalLessons = 0;
    let totalCards = 0;

    console.log("\n📚 Processing English lessons...");

    for (const { lesson, cards: cardsData } of allEnglishLessons) {
      const [insertedLesson] = await db
        .insert(lessons)
        .values({
          ...lesson,
          subjectId: englishSubjectId,
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

    console.log("\n🎉 English comprehensive seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Total lessons: ${totalLessons}`);
    console.log(`   - Total flashcards: ${totalCards}`);
    console.log(`   - Focus: Practical communication for Ivorian context`);
    console.log(`   - Levels: BEPC preparation and BAC advanced writing`);

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding comprehensive English:", error);
    throw error;
  }
}

if (require.main === module) {
  seedEnglishComprehensive()
    .then(() => {
      console.log("✨ English comprehensive seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 English comprehensive seeding failed:", error);
      process.exit(1);
    });
}
