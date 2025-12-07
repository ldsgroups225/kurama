/**
 * Database seeding script
 * Run this to populate the database with initial educational data
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(__dirname, "../../.env.development") });

import { initDatabase } from "../database/setup";
import { seedLearningStyles } from "./seed-learning-styles";
import {
  grades,
  series,
  subjects,
  levelSeries,
  subjectOfferings,
} from "@/drizzle/schema";
import {
  GRADES,
  SERIES,
  SUBJECTS,
  getLevelSeriesMappings,
  getSubjectOfferings,
} from "@/seeds/seed";

export async function seedDatabase() {
  // Initialize database connection
  const db = initDatabase({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  });

  console.log("🌱 Starting database seeding...");

  try {
    // 1. Insert Grades
    console.log("📚 Inserting grades...");
    await db
      .insert(grades)
      .values(GRADES)
      .onConflictDoNothing()
      .returning();

    // Fetch all grades to ensure we have IDs even if they were already inserted
    const allGrades = await db.select().from(grades);
    console.log(`✅ Grades ready: ${allGrades.length}`);

    // 2. Insert Series
    console.log("📖 Inserting series...");
    await db
      .insert(series)
      .values(SERIES)
      .onConflictDoNothing()
      .returning();

    // Fetch all series
    const allSeries = await db.select().from(series);
    console.log(`✅ Series ready: ${allSeries.length}`);

    // 3. Insert Subjects
    console.log("📝 Inserting subjects...");
    await db
      .insert(subjects)
      .values(SUBJECTS)
      .onConflictDoNothing()
      .returning();

    // Fetch all subjects
    const allSubjects = await db.select().from(subjects);
    console.log(`✅ Subjects ready: ${allSubjects.length}`);

    // 4. Create mappings for level-series relationships
    console.log("🔗 Creating level-series mappings...");
    const gradesMap = new Map(allGrades.map((g) => [g.name, g.id]));
    const seriesMap = new Map(allSeries.map((s) => [s.name, s.id]));

    const levelSeriesMappings = getLevelSeriesMappings(gradesMap, seriesMap);

    if (levelSeriesMappings.length > 0) {
      await db
        .insert(levelSeries)
        .values(levelSeriesMappings)
        .onConflictDoNothing()
        .execute();
    }
    console.log(`✅ Level-series mappings processed`);

    // 5. Create subject offerings
    console.log("📋 Creating subject offerings...");
    const subjectsMap = new Map(
      allSubjects.map((s) => [s.abbreviation, s.id])
    );

    const offerings = getSubjectOfferings(gradesMap, subjectsMap, seriesMap);

    // Check and insert offerings one by one or in batches to avoid duplicates if no unique constraint exists
    // Since there is no unique constraint on subjectOfferings, we need to be careful.
    // Ideally, we should add a unique constraint, but for now, let's check existence.

    let newOfferingsCount = 0;
    for (const offering of offerings) {
      const existing = await db.query.subjectOfferings.findFirst({
        where: (so, { eq, and, isNull }) =>
          and(
            eq(so.gradeId, offering.gradeId),
            eq(so.subjectId, offering.subjectId),
            offering.seriesId ? eq(so.seriesId, offering.seriesId) : isNull(so.seriesId)
          ),
      });

      if (!existing) {
        await db.insert(subjectOfferings).values(offering);
        newOfferingsCount++;
      }
    }
    console.log(`✅ Created ${newOfferingsCount} new subject offerings`);

    // 6. Seed Learning Styles & Demo Content
    console.log("\n🎨 Seeding learning styles and demo content...");
    await seedLearningStyles();

    console.log("🎉 Database seeding completed successfully!");

    return {
      success: true,
      stats: {
        grades: allGrades.length,
        series: allSeries.length,
        subjects: allSubjects.length,
        levelSeries: levelSeriesMappings.length,
        subjectOfferings: offerings.length, // Total offerings, not just new ones
      },
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✨ Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
