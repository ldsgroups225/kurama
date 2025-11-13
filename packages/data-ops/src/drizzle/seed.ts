import type {
  InsertGrade,
  InsertSeries,
  InsertSubject,
  InsertLevelSeries,
  InsertSubjectOffering,
} from "./schema";

// ============================================================================
// GRADES (Educational Levels)
// ============================================================================

export const GRADES: InsertGrade[] = [
  // PRIMARY SCHOOL (École Primaire)
  {
    name: "CP1",
    slug: "cp1",
    category: "PRIMARY",
    displayOrder: 1,
    isActive: false,
  },
  {
    name: "CP2",
    slug: "cp2",
    category: "PRIMARY",
    displayOrder: 2,
    isActive: false,
  },
  {
    name: "CE1",
    slug: "ce1",
    category: "PRIMARY",
    displayOrder: 3,
    isActive: false,
  },
  {
    name: "CE2",
    slug: "ce2",
    category: "PRIMARY",
    displayOrder: 4,
    isActive: false,
  },
  {
    name: "CM1",
    slug: "cm1",
    category: "PRIMARY",
    displayOrder: 5,
    isActive: false,
  },
  {
    name: "CM2",
    slug: "cm2",
    category: "PRIMARY",
    displayOrder: 6,
    isActive: false,
  },

  // MIDDLE SCHOOL (Collège)
  {
    name: "6ème",
    slug: "6eme",
    category: "COLLEGE",
    displayOrder: 7,
    isActive: false,
  },
  {
    name: "5ème",
    slug: "5eme",
    category: "COLLEGE",
    displayOrder: 8,
    isActive: false,
  },
  {
    name: "4ème",
    slug: "4eme",
    category: "COLLEGE",
    displayOrder: 9,
    isActive: false,
  },
  {
    name: "3ème",
    slug: "3eme",
    category: "COLLEGE",
    displayOrder: 10,
    isActive: true,
  },

  // HIGH SCHOOL (Lycée)
  {
    name: "2nde",
    slug: "2nde",
    category: "LYCEE",
    displayOrder: 11,
    isActive: false,
  },
  {
    name: "1ère",
    slug: "1ere",
    category: "LYCEE",
    displayOrder: 12,
    isActive: false,
  },
  {
    name: "Tle",
    slug: "tle",
    category: "LYCEE",
    displayOrder: 13,
    isActive: true,
  },
];

// ============================================================================
// SERIES (Lycée specializations)
// ============================================================================

export const SERIES: InsertSeries[] = [
  {
    name: "A",
    description: "Série Littéraire",
    displayOrder: 1,
  },
  {
    name: "C",
    description: "Série Scientifique",
    displayOrder: 2,
  },
  {
    name: "D",
    description: "Série Sciences Expérimentales",
    displayOrder: 3,
  },
  {
    name: "E",
    description: "Série Économique",
    displayOrder: 4,
  },
];

// ============================================================================
// SUBJECTS
// ============================================================================

export const SUBJECTS: InsertSubject[] = [
  // Core subjects
  {
    name: "Mathématiques",
    abbreviation: "MATH",
    description: "Mathématiques",
    displayOrder: 1,
  },
  {
    name: "Français",
    abbreviation: "FR",
    description: "Langue française",
    displayOrder: 2,
  },
  {
    name: "Anglais",
    abbreviation: "ANG",
    description: "Langue anglaise",
    displayOrder: 3,
  },
  {
    name: "Physique-Chimie",
    abbreviation: "PC",
    description: "Sciences physiques et chimiques",
    displayOrder: 4,
  },
  {
    name: "Sciences de la Vie et de la Terre",
    abbreviation: "SVT",
    description: "Biologie et géologie",
    displayOrder: 5,
  },
  {
    name: "Histoire-Géographie",
    abbreviation: "HG",
    description: "Histoire et géographie",
    displayOrder: 6,
  },
  {
    name: "Philosophie",
    abbreviation: "PHILO",
    description: "Philosophie",
    displayOrder: 7,
  },
  {
    name: "Éducation Civique et Morale",
    abbreviation: "ECM",
    description: "Éducation civique",
    displayOrder: 8,
  },
  {
    name: "Espagnol",
    abbreviation: "ESP",
    description: "Langue espagnole",
    displayOrder: 9,
  },
  {
    name: "Allemand",
    abbreviation: "ALL",
    description: "Langue allemande",
    displayOrder: 10,
  },
  {
    name: "Économie",
    abbreviation: "ECO",
    description: "Sciences économiques",
    displayOrder: 11,
  },
  {
    name: "Comptabilité",
    abbreviation: "COMPTA",
    description: "Comptabilité et gestion",
    displayOrder: 12,
  },
];

// ============================================================================
// LEVEL-SERIES MAPPINGS
// ============================================================================

/**
 * Defines which series are available for which grades
 * Only Lycée levels (2nde, 1ère, Tle) have series
 */
export function getLevelSeriesMappings(
  gradesMap: Map<string, number>,
  seriesMap: Map<string, number>
): InsertLevelSeries[] {
  const mappings: InsertLevelSeries[] = [];

  // 2nde - All series available
  const secondeId = gradesMap.get("2nde");
  if (secondeId) {
    ["A", "C", "E"].forEach((seriesName) => {
      const seriesId = seriesMap.get(seriesName);
      if (seriesId) {
        mappings.push({ gradeId: secondeId, seriesId });
      }
    });
  }

  // 1ère - All series available
  const premiereId = gradesMap.get("1ère");
  if (premiereId) {
    ["A", "C", "D", "E"].forEach((seriesName) => {
      const seriesId = seriesMap.get(seriesName);
      if (seriesId) {
        mappings.push({ gradeId: premiereId, seriesId });
      }
    });
  }

  // Tle - All series available
  const terminaleId = gradesMap.get("Tle");
  if (terminaleId) {
    ["A", "C", "D", "E"].forEach((seriesName) => {
      const seriesId = seriesMap.get(seriesName);
      if (seriesId) {
        mappings.push({ gradeId: terminaleId, seriesId });
      }
    });
  }

  return mappings;
}

// ============================================================================
// SUBJECT OFFERINGS
// ============================================================================

/**
 * Defines which subjects are available for which grade/series combinations
 * This is a simplified version - you should expand this based on actual curriculum
 */
export function getSubjectOfferings(
  gradesMap: Map<string, number>,
  subjectsMap: Map<string, number>,
  seriesMap: Map<string, number>
): InsertSubjectOffering[] {
  const offerings: InsertSubjectOffering[] = [];

  // Helper function to add offerings
  const addOffering = (
    gradeName: string,
    subjectAbbr: string,
    isMandatory: boolean = true,
    coefficient: number = 1,
    seriesName?: string
  ) => {
    const gradeId = gradesMap.get(gradeName);
    const subjectId = subjectsMap.get(subjectAbbr);
    const seriesId = seriesName ? seriesMap.get(seriesName) : undefined;

    if (gradeId && subjectId) {
      offerings.push({
        gradeId,
        subjectId,
        seriesId: seriesId || null,
        isMandatory,
        coefficient,
      });
    }
  };

  // PRIMARY SCHOOL - Basic subjects for all levels
  const primaryLevels = ["CP1", "CP2", "CE1", "CE2", "CM1", "CM2"];
  primaryLevels.forEach((level) => {
    addOffering(level, "MATH", true, 1);
    addOffering(level, "FR", true, 1);
  });

  // COLLEGE - More subjects
  const collegeLevels = ["6ème", "5ème", "4ème", "3ème"];
  collegeLevels.forEach((level) => {
    addOffering(level, "MATH", true, 3);
    addOffering(level, "FR", true, 3);
    addOffering(level, "ANG", true, 2);
    addOffering(level, "PC", true, 2);
    addOffering(level, "SVT", true, 2);
    addOffering(level, "HG", true, 2);
    addOffering(level, "ECM", true, 1);
  });

  // LYCÉE - Series-specific subjects
  // Série A (Littéraire)
  addOffering("2nde", "FR", true, 4, "A");
  addOffering("2nde", "PHILO", true, 3, "A");
  addOffering("2nde", "HG", true, 3, "A");
  addOffering("2nde", "MATH", true, 2, "A");
  addOffering("2nde", "ANG", true, 2, "A");

  addOffering("1ère", "FR", true, 5, "A");
  addOffering("1ère", "PHILO", true, 4, "A");
  addOffering("1ère", "HG", true, 3, "A");
  addOffering("1ère", "MATH", true, 2, "A");
  addOffering("1ère", "ANG", true, 2, "A");

  addOffering("Tle", "FR", true, 5, "A");
  addOffering("Tle", "PHILO", true, 5, "A");
  addOffering("Tle", "HG", true, 4, "A");
  addOffering("Tle", "MATH", true, 2, "A");
  addOffering("Tle", "ANG", true, 2, "A");

  // Série C (Scientifique)
  addOffering("2nde", "MATH", true, 4, "C");
  addOffering("2nde", "PC", true, 4, "C");
  addOffering("2nde", "SVT", true, 2, "C");
  addOffering("2nde", "FR", true, 2, "C");
  addOffering("2nde", "ANG", true, 2, "C");

  addOffering("1ère", "MATH", true, 5, "C");
  addOffering("1ère", "PC", true, 5, "C");
  addOffering("1ère", "SVT", true, 2, "C");
  addOffering("1ère", "FR", true, 2, "C");
  addOffering("1ère", "ANG", true, 2, "C");

  addOffering("Tle", "MATH", true, 6, "C");
  addOffering("Tle", "PC", true, 6, "C");
  addOffering("Tle", "SVT", true, 3, "C");
  addOffering("Tle", "FR", true, 2, "C");
  addOffering("Tle", "ANG", true, 2, "C");

  // Série D (Sciences Expérimentales)
  addOffering("2nde", "MATH", true, 3, "D");
  addOffering("2nde", "PC", true, 3, "D");
  addOffering("2nde", "SVT", true, 4, "D");
  addOffering("2nde", "FR", true, 2, "D");
  addOffering("2nde", "ANG", true, 2, "D");

  addOffering("1ère", "MATH", true, 4, "D");
  addOffering("1ère", "PC", true, 4, "D");
  addOffering("1ère", "SVT", true, 5, "D");
  addOffering("1ère", "FR", true, 2, "D");
  addOffering("1ère", "ANG", true, 2, "D");

  addOffering("Tle", "MATH", true, 4, "D");
  addOffering("Tle", "PC", true, 4, "D");
  addOffering("Tle", "SVT", true, 6, "D");
  addOffering("Tle", "FR", true, 2, "D");
  addOffering("Tle", "ANG", true, 2, "D");

  // Série E (Économique)
  addOffering("2nde", "MATH", true, 3, "E");
  addOffering("2nde", "ECO", true, 4, "E");
  addOffering("2nde", "COMPTA", true, 3, "E");
  addOffering("2nde", "FR", true, 2, "E");
  addOffering("2nde", "ANG", true, 2, "E");

  addOffering("1ère", "MATH", true, 3, "E");
  addOffering("1ère", "ECO", true, 5, "E");
  addOffering("1ère", "COMPTA", true, 4, "E");
  addOffering("1ère", "FR", true, 2, "E");
  addOffering("1ère", "ANG", true, 2, "E");

  addOffering("Tle", "MATH", true, 3, "E");
  addOffering("Tle", "ECO", true, 6, "E");
  addOffering("Tle", "COMPTA", true, 5, "E");
  addOffering("Tle", "FR", true, 2, "E");
  addOffering("Tle", "ANG", true, 2, "E");

  return offerings;
}
