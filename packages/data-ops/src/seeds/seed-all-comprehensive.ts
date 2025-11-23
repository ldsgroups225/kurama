/**
 * Master Comprehensive Seeding Script
 * Executes all comprehensive subject-specific seed files
 * Complete Ivorian educational content for BEPC/BAC preparation
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

// Import all seed functions
import { seedDatabase } from "./seed-db";
import { seedLessons } from "./seed-lessons";
import { seedLessonsExtended } from "./seed-lessons-extended";
import { seedMathematicsComprehensive } from "./seed-maths-comprehensive";
import { seedMathematicsTerminaleComprehensive } from "./seed-maths-terminale-comprehensive";
import { seedSVTComprehensive } from "./seed-svt-comprehensive";
import { seedHistoryGeographyComprehensive } from "./seed-history-geography-comprehensive";
import { seedPhysicsChemistryComprehensive } from "./seed-physics-chemistry-comprehensive";
import { seedFrenchComprehensive } from "./seed-french-comprehensive";
import { seedEnglishComprehensive } from "./seed-english-comprehensive";
import { seedPhilosophyComprehensive } from "./seed-philosophy-comprehensive";
import { seedEconomicsComprehensive } from "./seed-economics-comprehensive";
import { seedSpanishComprehensive } from "./seed-spanish-comprehensive";
import { seedECMComprehensive } from "./seed-ecm-comprehensive";

interface SeedResult {
  success: boolean;
  stats?: {
    lessons?: number;
    cards?: number;
    grades?: number;
    series?: number;
    subjects?: number;
  };
  message?: string;
}

export async function seedAllComprehensive(): Promise<SeedResult> {
  console.log("🚀 Starting MEGA comprehensive seeding for Kurama platform...");
  console.log("📚 This will populate the database with extensive Ivorian educational content");
  console.log("🇨🇮 Adapted specifically for Côte d'Ivoire BEPC/BAC preparation\n");

  const results: { [key: string]: SeedResult } = {};
  let totalLessons = 0;
  let totalCards = 0;

  try {
    // Phase 1: Basic Database Structure
    console.log("🏗️  Phase 1: Setting up basic database structure...");
    results.dbStructure = await seedDatabase();
    if (results.dbStructure.success) {
      console.log("✅ Database structure created successfully");
      console.log(`   - Grades: ${results.dbStructure.stats?.grades || 0}`);
      console.log(`   - Series: ${results.dbStructure.stats?.series || 0}`);
      console.log(`   - Subjects: ${results.dbStructure.stats?.subjects || 0}`);
    }

    // Phase 2: Original Lessons
    console.log("\n📖 Phase 2: Adding original lessons content...");
    results.originalLessons = await seedLessons();
    if (results.originalLessons.success) {
      console.log("✅ Original lessons added successfully");
      console.log(`   - Lessons: ${results.originalLessons.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.originalLessons.stats?.cards || 0}`);
      totalLessons += results.originalLessons.stats?.lessons || 0;
      totalCards += results.originalLessons.stats?.cards || 0;
    }

    // Phase 3: Extended Lessons
    console.log("\n📚 Phase 3: Adding extended lessons content...");
    results.extendedLessons = await seedLessonsExtended();
    if (results.extendedLessons.success) {
      console.log("✅ Extended lessons added successfully");
      console.log(`   - Lessons: ${results.extendedLessons.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.extendedLessons.stats?.cards || 0}`);
      totalLessons += results.extendedLessons.stats?.lessons || 0;
      totalCards += results.extendedLessons.stats?.cards || 0;
    }

    // Phase 4: Comprehensive Mathematics
    console.log("\n🔢 Phase 4: Adding comprehensive Mathematics content...");
    results.mathematics = await seedMathematicsComprehensive();
    if (results.mathematics.success) {
      console.log("✅ Mathematics comprehensive content added successfully");
      console.log(`   - Lessons: ${results.mathematics.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.mathematics.stats?.cards || 0}`);
      totalLessons += results.mathematics.stats?.lessons || 0;
      totalCards += results.mathematics.stats?.cards || 0;
    }

    // Phase 5: Comprehensive SVT
    console.log("\n🧬 Phase 5: Adding comprehensive SVT content...");
    results.svt = await seedSVTComprehensive();
    if (results.svt.success) {
      console.log("✅ SVT comprehensive content added successfully");
      console.log(`   - Lessons: ${results.svt.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.svt.stats?.cards || 0}`);
      totalLessons += results.svt.stats?.lessons || 0;
      totalCards += results.svt.stats?.cards || 0;
    }

    // Phase 6: Comprehensive History-Geography
    console.log("\n🗺️  Phase 6: Adding comprehensive History-Geography content...");
    results.historyGeography = await seedHistoryGeographyComprehensive();
    if (results.historyGeography.success) {
      console.log("✅ History-Geography comprehensive content added successfully");
      console.log(`   - Lessons: ${results.historyGeography.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.historyGeography.stats?.cards || 0}`);
      totalLessons += results.historyGeography.stats?.lessons || 0;
      totalCards += results.historyGeography.stats?.cards || 0;
    }

    // Phase 7: Advanced Mathematics (Terminale BAC)
    console.log("\n🧮 Phase 7: Adding comprehensive Terminale Mathematics content...");
    results.mathematicsTerminale = await seedMathematicsTerminaleComprehensive();
    if (results.mathematicsTerminale.success) {
      console.log("✅ Terminale Mathematics comprehensive content added successfully");
      console.log(`   - Lessons: ${results.mathematicsTerminale.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.mathematicsTerminale.stats?.cards || 0}`);
      totalLessons += results.mathematicsTerminale.stats?.lessons || 0;
      totalCards += results.mathematicsTerminale.stats?.cards || 0;
    }

    // Phase 8: Comprehensive Physics-Chemistry
    console.log("\n⚗️  Phase 8: Adding comprehensive Physics-Chemistry content...");
    results.physicsChemistry = await seedPhysicsChemistryComprehensive();
    if (results.physicsChemistry.success) {
      console.log("✅ Physics-Chemistry comprehensive content added successfully");
      console.log(`   - Lessons: ${results.physicsChemistry.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.physicsChemistry.stats?.cards || 0}`);
      totalLessons += results.physicsChemistry.stats?.lessons || 0;
      totalCards += results.physicsChemistry.stats?.cards || 0;
    }

    // Phase 9: Comprehensive French Language
    console.log("\n📝 Phase 9: Adding comprehensive French Language content...");
    results.french = await seedFrenchComprehensive();
    if (results.french.success) {
      console.log("✅ French Language comprehensive content added successfully");
      console.log(`   - Lessons: ${results.french.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.french.stats?.cards || 0}`);
      totalLessons += results.french.stats?.lessons || 0;
      totalCards += results.french.stats?.cards || 0;
    }

    // Phase 10: Comprehensive English Language
    console.log("\n🇬🇧 Phase 10: Adding comprehensive English Language content...");
    results.english = await seedEnglishComprehensive();
    if (results.english.success) {
      console.log("✅ English Language comprehensive content added successfully");
      console.log(`   - Lessons: ${results.english.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.english.stats?.cards || 0}`);
      totalLessons += results.english.stats?.lessons || 0;
      totalCards += results.english.stats?.cards || 0;
    }

    // Phase 11: Comprehensive Philosophy
    console.log("\n🤔 Phase 11: Adding comprehensive Philosophy content...");
    results.philosophy = await seedPhilosophyComprehensive();
    if (results.philosophy.success) {
      console.log("✅ Philosophy comprehensive content added successfully");
      console.log(`   - Lessons: ${results.philosophy.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.philosophy.stats?.cards || 0}`);
      totalLessons += results.philosophy.stats?.lessons || 0;
      totalCards += results.philosophy.stats?.cards || 0;
    }

    // Phase 12: Comprehensive Economics
    console.log("\n💰 Phase 12: Adding comprehensive Economics content...");
    results.economics = await seedEconomicsComprehensive();
    if (results.economics.success) {
      console.log("✅ Economics comprehensive content added successfully");
      console.log(`   - Lessons: ${results.economics.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.economics.stats?.cards || 0}`);
      totalLessons += results.economics.stats?.lessons || 0;
      totalCards += results.economics.stats?.cards || 0;
    }

    // Phase 13: Comprehensive Spanish
    console.log("\n🇪🇸 Phase 13: Adding comprehensive Spanish content...");
    results.spanish = await seedSpanishComprehensive();
    if (results.spanish.success) {
      console.log("✅ Spanish comprehensive content added successfully");
      console.log(`   - Lessons: ${results.spanish.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.spanish.stats?.cards || 0}`);
      totalLessons += results.spanish.stats?.lessons || 0;
      totalCards += results.spanish.stats?.cards || 0;
    }

    // Phase 14: Comprehensive ECM/EDHC
    console.log("\n🇨🇮 Phase 14: Adding comprehensive ECM/EDHC content...");
    results.ecm = await seedECMComprehensive();
    if (results.ecm.success) {
      console.log("✅ ECM/EDHC comprehensive content added successfully");
      console.log(`   - Lessons: ${results.ecm.stats?.lessons || 0}`);
      console.log(`   - Cards: ${results.ecm.stats?.cards || 0}`);
      totalLessons += results.ecm.stats?.lessons || 0;
      totalCards += results.ecm.stats?.cards || 0;
    }

    // Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 MEGA COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("📊 FINAL SUMMARY:");
    console.log(`   📚 Total Lessons: ${totalLessons}`);
    console.log(`   🃏 Total Flashcards: ${totalCards}`);
    console.log(`   🎯 Average cards per lesson: ${totalLessons > 0 ? Math.round(totalCards / totalLessons) : 0}`);

    console.log("\n📋 CONTENT BREAKDOWN:");
    for (const [phase, result] of Object.entries(results)) {
      if (result.success && result.stats?.lessons) {
        const phaseName = phase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   ✅ ${phaseName}: ${result.stats.lessons} lessons, ${result.stats.cards || 0} cards`);
      }
    }

    console.log("\n🎓 EDUCATIONAL COVERAGE:");
    console.log("   ✅ Mathematics (BEPC & BAC all series)");
    console.log("   ✅ SVT - Life & Earth Sciences (BEPC & BAC)");
    console.log("   ✅ History & Geography (BEPC & BAC)");
    console.log("   ✅ Physics-Chemistry (BEPC & BAC)");
    console.log("   ✅ French Language & Literature");
    console.log("   ✅ English Language");
    console.log("   ✅ Philosophy (BAC Series A & D)");
    console.log("   ✅ Economics (BAC Series E)");
    console.log("   ✅ Spanish Language (BEPC & BAC)");
    console.log("   ✅ ECM / EDHC (Civic & Moral Education)");

    console.log("\n🇨🇮 IVORIAN CONTEXT:");
    console.log("   ✅ BEPC (3ème) preparation");
    console.log("   ✅ BAC (Tle) all series (A, C, D, E)");
    console.log("   ✅ Local examples and applications");
    console.log("   ✅ Cultural relevance");
    console.log("   ✅ Regional integration (ECOWAS, UEMOA)");

    console.log("\n🎮 PLATFORM FEATURES:");
    console.log("   ✅ Multiple card types (basic, multichoice, true_false, fill_blank)");
    console.log("   ✅ Gamification with points system");
    console.log("   ✅ Progressive difficulty levels");
    console.log("   ✅ Subject-specific content");

    return {
      success: true,
      stats: {
        lessons: totalLessons,
        cards: totalCards,
      },
      message: "Mega comprehensive seeding completed successfully",
    };

  } catch (error) {
    console.error("❌ MEGA COMPREHENSIVE SEEDING FAILED:", error);
    console.log("\n⚠️  PARTIAL RESULTS:");
    for (const [phase, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`   ✅ ${phase}: Completed`);
      } else {
        console.log(`   ❌ ${phase}: Failed - ${result.message}`);
      }
    }

    return {
      success: false,
      message: `Mega seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  console.log("🎯 Starting Kurama Mega Comprehensive Seeding...\n");

  seedAllComprehensive()
    .then((result) => {
      if (result.success) {
        console.log("\n✨ MEGA SEEDING COMPLETED SUCCESSFULLY!");
        console.log("🚀 Kurama platform is now ready with comprehensive Ivorian educational content!");
        process.exit(0);
      } else {
        console.error("\n💥 MEGA SEEDING FAILED:", result.message);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 UNEXPECTED ERROR DURING MEGA SEEDING:", error);
      process.exit(1);
    });
}
