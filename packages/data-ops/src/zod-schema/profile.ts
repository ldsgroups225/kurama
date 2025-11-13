import { z } from "zod";

/**
 * User type selection schema
 */
export const userTypeSchema = z.enum(["student", "parent"]);

/**
 * Student profile schema
 */
export const studentProfileSchema = z.object({
  userType: z.literal("student"),
  // Basic Information
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  // Contact Information
  phone: z
    .string()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .optional(),
  age: z
    .number()
    .int()
    .min(10, "L'âge minimum est 10 ans")
    .max(25, "L'âge maximum est 25 ans")
    .optional(),
  gender: z.enum(["male", "female"]).optional(),
  city: z.string().max(100, "Le nom de la ville ne peut pas dépasser 100 caractères").optional(),
  // Educational Information
  idNumber: z
    .string()
    .length(9, "Le numéro matricule doit contenir exactement 9 caractères")
    .optional(),
  gradeName: z.string().min(1, "Veuillez sélectionner votre niveau"),
  seriesName: z.string().optional(),
  // Preferences
  favoriteSubjects: z.array(z.string()).optional(),
  learningGoals: z.string().max(500, "Les objectifs ne peuvent pas dépasser 500 caractères").optional(),
  studyTime: z.string().optional(),
});

/**
 * Parent profile schema
 */
export const parentProfileSchema = z.object({
  userType: z.literal("parent"),
  // Basic Information
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  // Children Information
  childrenMatricules: z
    .array(z.number().int().positive("Le matricule doit être un nombre positif"))
    .optional(),
});

/**
 * Combined profile schema (discriminated union)
 */
export const profileSchema = z.discriminatedUnion("userType", [
  studentProfileSchema,
  parentProfileSchema,
]);

/**
 * Type exports
 */
export type UserType = z.infer<typeof userTypeSchema>;
export type StudentProfile = z.infer<typeof studentProfileSchema>;
export type ParentProfile = z.infer<typeof parentProfileSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
