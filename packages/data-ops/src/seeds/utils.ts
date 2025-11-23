
import { lessons, cards } from "@/drizzle/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";

export type DbType = NodePgDatabase<typeof schema>;

export interface LessonData {
  title: string;
  description?: string;
  difficulty?: string;
  estimatedDuration?: number;
  isPublished?: boolean;
  publishedAt?: string;
  displayOrder?: number;
}

export interface CardData {
  frontContent: string;
  backContent: string;
  cardType?: string;
  difficulty?: number;
  displayOrder: number;
  metadata?: unknown;
  question?: string;
  options?: unknown;
  correctAnswer?: string;
  explanation?: string;
  hints?: unknown;
  timeLimit?: number;
  points?: number;
}

export async function seedLesson(
  db: any, // Using any to avoid complex type issues with different Drizzle instances, but ideally should be typed
  subjectId: number,
  lessonData: LessonData,
  cardsData: CardData[]
): Promise<{ lessonId: number; created: boolean; cardsCount: number }> {
  // Check if lesson exists
  const existingLesson = await db.query.lessons.findFirst({
    where: (lessons: any, { eq, and }: any) =>
      and(
        eq(lessons.title, lessonData.title),
        eq(lessons.subjectId, subjectId)
      ),
  });

  if (existingLesson) {
    // console.log(`   ℹ️  Lesson already exists: ${lessonData.title}`);
    return { lessonId: existingLesson.id, created: false, cardsCount: 0 };
  }

  // Insert lesson
  const [insertedLesson] = await db
    .insert(lessons)
    .values({
      ...lessonData,
      subjectId,
    })
    .returning();

  if (!insertedLesson) {
    throw new Error(`Failed to insert lesson: ${lessonData.title}`);
  }

  // Insert cards
  if (cardsData.length > 0) {
    const cardsToInsert = cardsData.map((card) => ({
      ...card,
      lessonId: insertedLesson.id,
    }));

    await db.insert(cards).values(cardsToInsert);
  }

  return {
    lessonId: insertedLesson.id,
    created: true,
    cardsCount: cardsData.length,
  };
}
