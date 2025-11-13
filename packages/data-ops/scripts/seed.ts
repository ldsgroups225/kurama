#!/usr/bin/env tsx
/**
 * Standalone database seeding script
 * Usage: tsx scripts/seed.ts
 */

import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/drizzle/schema";
import * as authSchema from "../src/drizzle/auth-schema";
import {
  GRADES,
  SERIES,
  SUBJECTS,
  getLevelSeriesMappings,
  getSubjectOfferings,
} from "../src/drizzle/seed";

async function main() {
  // Get connection string from environment
  const connectionString = `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`;

  console.log("🔌 Connecting to database...");
  const db = drizzle(connectionString, { schema: { ...schema, ...authSchema } });

  console.log("🌱 Starting database seeding...");

  try {
    // 1. Insert Grades
    console.log("📚 Inserting grades...");
    const insertedGrades = await db
      .insert(schema.grades)
      .values(GRADES)
      .onConflictDoNothing()
      .returning();
    console.log(`✅ Inserted ${insertedGrades.length} grades`);

    // 2. Insert Series
    console.log("📖 Inserting series...");
    const insertedSeries = await db
      .insert(schema.series)
      .values(SERIES)
      .onConflictDoNothing()
      .returning();
    console.log(`✅ Inserted ${insertedSeries.length} series`);

    // 3. Insert Subjects
    console.log("📝 Inserting subjects...");
    const insertedSubjects = await db
      .insert(schema.subjects)
      .values(SUBJECTS)
      .onConflictDoNothing()
      .returning();
    console.log(`✅ Inserted ${insertedSubjects.length} subjects`);

    // 4. Fetch all grades and series for mappings
    const allGrades = await db.select().from(schema.grades);
    const allSeries = await db.select().from(schema.series);
    const allSubjects = await db.select().from(schema.subjects);

    // 5. Create mappings for level-series relationships
    console.log("🔗 Creating level-series mappings...");
    const gradesMap = new Map(allGrades.map((g) => [g.name, g.id]));
    const seriesMap = new Map(allSeries.map((s) => [s.name, s.id]));

    const levelSeriesMappings = getLevelSeriesMappings(gradesMap, seriesMap);
    await db
      .insert(schema.levelSeries)
      .values(levelSeriesMappings)
      .onConflictDoNothing();
    console.log(`✅ Created ${levelSeriesMappings.length} level-series mappings`);

    // 6. Create subject offerings
    console.log("📋 Creating subject offerings...");
    const subjectsMap = new Map(allSubjects.map((s) => [s.abbreviation, s.id]));

    const offerings = getSubjectOfferings(gradesMap, subjectsMap, seriesMap);
    await db
      .insert(schema.subjectOfferings)
      .values(offerings)
      .onConflictDoNothing();
    console.log(`✅ Created ${offerings.length} subject offerings`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main();
