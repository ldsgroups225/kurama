/**
 * Database seeding script
 * Run this to populate the database with initial educational data
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(__dirname, "../../.env") });

import { initDatabase } from "./setup";
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
} from "@/drizzle/seed";

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
    const insertedGrades = await db.insert(grades).values(GRADES).returning();
    console.log(`✅ Inserted ${insertedGrades.length} grades`);

    // 2. Insert Series
    console.log("📖 Inserting series...");
    const insertedSeries = await db.insert(series).values(SERIES).returning();
    console.log(`✅ Inserted ${insertedSeries.length} series`);

    // 3. Insert Subjects
    console.log("📝 Inserting subjects...");
    const insertedSubjects = await db
      .insert(subjects)
      .values(SUBJECTS)
      .returning();
    console.log(`✅ Inserted ${insertedSubjects.length} subjects`);

    // 4. Create mappings for level-series relationships
    console.log("🔗 Creating level-series mappings...");
    const gradesMap = new Map(insertedGrades.map((g) => [g.name, g.id]));
    const seriesMap = new Map(insertedSeries.map((s) => [s.name, s.id]));

    const levelSeriesMappings = getLevelSeriesMappings(gradesMap, seriesMap);
    await db.insert(levelSeries).values(levelSeriesMappings);
    console.log(`✅ Created ${levelSeriesMappings.length} level-series mappings`);

    // 5. Create subject offerings
    console.log("📋 Creating subject offerings...");
    const subjectsMap = new Map(
      insertedSubjects.map((s) => [s.abbreviation, s.id])
    );

    const offerings = getSubjectOfferings(gradesMap, subjectsMap, seriesMap);
    await db.insert(subjectOfferings).values(offerings);
    console.log(`✅ Created ${offerings.length} subject offerings`);

    console.log("🎉 Database seeding completed successfully!");

    return {
      success: true,
      stats: {
        grades: insertedGrades.length,
        series: insertedSeries.length,
        subjects: insertedSubjects.length,
        levelSeries: levelSeriesMappings.length,
        subjectOfferings: offerings.length,
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
