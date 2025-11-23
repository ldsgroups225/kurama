/**
 * Learning Styles & Gamification Seeding Script
 * Populates learning modes and demo content
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../../.env") });

import { initDatabase } from "../database/setup";
import { lessons, cards, learningModeConfigs } from "@/drizzle/schema";

export async function seedLearningStyles() {
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting Learning Styles seeding...");

  try {
    // 1. Seed Learning Modes
    console.log("⚙️  Seeding Learning Modes...");
    const modes = [
      {
        modeName: "flashcard",
        supportedTypes: ["basic"],
        settings: { showHints: false, timePressure: false, immediateFeedback: false },
      },
      {
        modeName: "quiz",
        supportedTypes: ["basic", "multichoice", "true_false", "fill_blank", "matching"],
        settings: { showHints: true, timePressure: true, immediateFeedback: true },
      },
      {
        modeName: "test",
        supportedTypes: ["multichoice", "true_false", "fill_blank", "ordering"],
        settings: { showHints: false, timePressure: true, immediateFeedback: false },
      },
    ];

    for (const mode of modes) {
      await db
        .insert(learningModeConfigs)
        .values(mode)
        .onConflictDoNothing()
        .execute();
    }
    console.log("   ✅ Learning Modes created");

    // 2. Create Demo Lesson with Mixed Types
    console.log("\n📚 Creating Demo Lesson (Mixed Types)...");

    // Find a subject (e.g., English or Math)
    const subject = await db.query.subjects.findFirst({
      where: (subjects, { eq }) => eq(subjects.abbreviation, "ANG"),
    });

    if (!subject) {
      console.warn("⚠️  Subject ANG not found, skipping demo lesson...");
      return;
    }

    // Check if lesson already exists
    const existingLesson = await db.query.lessons.findFirst({
      where: (lessons, { eq, and }) =>
        and(
          eq(lessons.title, "Demo: Mixed Learning Styles"),
          eq(lessons.subjectId, subject.id)
        ),
    });

    if (existingLesson) {
      console.log(`   ℹ️  Demo lesson already exists: ${existingLesson.title}`);
      return;
    }

    // Create Lesson
    const [lesson] = await db
      .insert(lessons)
      .values({
        title: "Demo: Mixed Learning Styles",
        description: "Showcase of new card types: MCQ, True/False, Fill-in-the-Blank",
        subjectId: subject.id,
        difficulty: "medium",
        isPublished: true,
        displayOrder: 99,
      })
      .returning();

    if (!lesson) {
      console.error('Failed to create or find lesson');
      return;
    }

    console.log(`   ✅ Created lesson: ${lesson.title}`);

    // Create Cards
    const newCards = [
      // Flashcard
      {
        lessonId: lesson.id,
        cardType: "basic",
        frontContent: "What is the capital of France?",
        backContent: "Paris",
        displayOrder: 1,
        points: 10,
      },
      // Multiple Choice
      {
        lessonId: lesson.id,
        cardType: "multichoice",
        frontContent: "Select the correct translation for 'Dog'",
        backContent: "Chien",
        question: "What is the French word for 'Dog'?",
        options: [
          { id: "1", text: "Chat", isCorrect: false },
          { id: "2", text: "Chien", isCorrect: true },
          { id: "3", text: "Cheval", isCorrect: false },
          { id: "4", text: "Oiseau", isCorrect: false },
        ],
        explanation: "'Chien' is the French word for dog. 'Chat' is cat.",
        displayOrder: 2,
        points: 15,
      },
      // True/False
      {
        lessonId: lesson.id,
        cardType: "true_false",
        frontContent: "The sun rises in the West.",
        backContent: "False",
        correctAnswer: "false",
        explanation: "The sun rises in the East and sets in the West.",
        displayOrder: 3,
        points: 10,
      },
      // Fill in Blank
      {
        lessonId: lesson.id,
        cardType: "fill_blank",
        frontContent: "Complete the sentence: 'I ___ to the cinema yesterday.'",
        backContent: "went",
        correctAnswer: "went",
        hints: ["Past tense of 'go'"],
        displayOrder: 4,
        points: 20,
      },
    ];

    await db.insert(cards).values(newCards);
    console.log(`   📝 Added ${newCards.length} mixed cards`);

    console.log("\n🎉 Learning Styles seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding learning styles:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedLearningStyles()
    .then(() => {
      console.log("✨ Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
