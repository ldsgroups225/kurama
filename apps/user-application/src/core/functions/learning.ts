import { createServerFn } from "@tanstack/react-start";
import { protectedFunctionMiddleware } from "@/core/middleware/auth";
import { getDb } from "@kurama/data-ops/database/setup";
import { subjects, lessons, cards } from "@kurama/data-ops/drizzle/schema";
import { eq, asc } from "@kurama/data-ops/database/drizzle-orm";

/**
 * Get all active subjects for the subject selection screen
 */
export const getSubjects = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async () => {
    const db = getDb();

    return db.query.subjects.findMany({
      orderBy: [asc(subjects.displayOrder)],
    });
  });

/**
 * Get lessons for a specific subject
 */
export const getLessonsBySubject = createServerFn({ method: "GET" })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => {
    if (typeof data !== "number" || isNaN(data)) {
      throw new Error("Invalid input: subjectId must be a number");
    }
    return data;
  })
  .handler(async ({ data: subjectId }) => {
    const db = getDb();

    const lessonsData = await db.query.lessons.findMany({
      where: eq(lessons.subjectId, subjectId),
      orderBy: [asc(lessons.id)],
      with: {
        subject: true,
      },
    });

    return lessonsData;
  });

/**
 * Get a single lesson with all its cards for the learning session
 */
export const getLessonDetails = createServerFn({ method: "GET" })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => {
    if (typeof data !== "number" || isNaN(data)) {
      throw new Error("Invalid input: lessonId must be a number");
    }
    return data;
  })
  .handler(async ({ data: lessonId }) => {
    const db = getDb();

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        subject: true,
        cards: {
          orderBy: [asc(cards.displayOrder)],
        },
      },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Type assertion to handle metadata field (json type defaults to unknown)
    return {
      ...lesson,
      cards: lesson.cards.map(card => ({
        ...card,
        metadata: (card.metadata ?? {}) as { [x: string]: {} },
      })),
    };
  });
