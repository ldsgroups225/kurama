# User Profiles Schema Update

## Overview
Updated the `userProfiles` table schema to support the enhanced multi-step onboarding forms for both students and parents.

## Schema Changes

### New Student Fields

#### Contact Information
- `phone` (text, optional) - Student's phone number
- `age` (integer, optional) - Student's age (10-25 years)
- `gender` (text enum: "male" | "female", optional) - Student's gender
- `city` (text, optional) - Student's city of residence

#### Educational Information
- `idNumber` (text, optional) - Student matricule (9 characters)

#### Preferences
- `favoriteSubjects` (json array, optional) - Array of favorite subject names
- `learningGoals` (text, optional) - Student's learning objectives (max 500 chars)
- `studyTime` (text, optional) - Daily study time preference

### New Parent Fields

#### Children Information
- `childrenMatricules` (json array, optional) - Array of student matricule numbers
  - Replaces the old `childrenCount` field
  - Allows direct linking to student profiles

### Removed Fields
- `childrenCount` (integer) - Replaced by `childrenMatricules` array

## Database Migration

Migration file: `0002_lying_galactus.sql`

### Changes Applied
```sql
-- Add new student fields
ALTER TABLE "user_profiles" ADD COLUMN "phone" text;
ALTER TABLE "user_profiles" ADD COLUMN "age" integer;
ALTER TABLE "user_profiles" ADD COLUMN "gender" text;
ALTER TABLE "user_profiles" ADD COLUMN "city" text;
ALTER TABLE "user_profiles" ADD COLUMN "id_number" text;
ALTER TABLE "user_profiles" ADD COLUMN "favorite_subjects" json;
ALTER TABLE "user_profiles" ADD COLUMN "learning_goals" text;
ALTER TABLE "user_profiles" ADD COLUMN "study_time" text;

-- Add new parent field
ALTER TABLE "user_profiles" ADD COLUMN "children_matricules" json;

-- Remove old field
ALTER TABLE "user_profiles" DROP COLUMN "children_count";
```

## Zod Schema Updates

### Student Profile Schema
```typescript
export const studentProfileSchema = z.object({
  userType: z.literal("student"),
  // Basic Information
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  // Contact Information
  phone: z.string().min(8).max(20).optional(),
  age: z.number().int().min(10).max(25).optional(),
  gender: z.enum(["male", "female"]).optional(),
  city: z.string().max(100).optional(),
  // Educational Information
  idNumber: z.string().length(9).optional(),
  gradeName: z.string().min(1),
  seriesName: z.string().optional(),
  // Preferences
  favoriteSubjects: z.array(z.string()).optional(),
  learningGoals: z.string().max(500).optional(),
  studyTime: z.string().optional(),
});
```

### Parent Profile Schema
```typescript
export const parentProfileSchema = z.object({
  userType: z.literal("parent"),
  // Basic Information
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  // Children Information
  childrenMatricules: z.array(
    z.number().int().positive()
  ).optional(),
});
```

## Form Integration

### Student Profile Form (4 Steps)
1. **Personal Information** - firstName, lastName, age, gender
2. **Contact Information** - phone, city
3. **Educational Information** - idNumber, gradeName, seriesName
4. **Preferences** - favoriteSubjects, studyTime, learningGoals

### Parent Profile Form (2 Steps)
1. **Personal Information** - firstName, lastName
2. **Children Information** - childrenMatricules (dynamic array)

## Data Types

### JSON Fields
- `favoriteSubjects`: `string[]` - Array of subject names
- `childrenMatricules`: `number[]` - Array of student matricule numbers

### Enum Fields
- `gender`: `"male" | "female"`
- `userType`: `"student" | "parent"`

## Validation Rules

### Student Fields
- **phone**: 8-20 characters
- **age**: 10-25 years
- **idNumber**: Exactly 9 characters
- **learningGoals**: Max 500 characters
- **city**: Max 100 characters

### Parent Fields
- **childrenMatricules**: Array of positive integers

## Migration Steps

1. Generate migration:
   ```bash
   cd packages/data-ops
   pnpm run drizzle:generate
   ```

2. Review migration file:
   ```bash
   cat src/drizzle/0002_lying_galactus.sql
   ```

3. Apply migration (when ready):
   ```bash
   pnpm run drizzle:migrate
   ```

4. Rebuild package:
   ```bash
   pnpm run build
   ```

## Backward Compatibility

### Breaking Changes
- `childrenCount` field removed from parent profiles
- Existing parent profiles will need data migration if they have `childrenCount` set

### Migration Strategy for Existing Data
If you have existing parent profiles with `childrenCount`:
1. No automatic migration of `childrenCount` to `childrenMatricules`
2. Parents will need to re-enter their children's matricules
3. Consider creating a data migration script if needed

## Future Enhancements

### Potential Additions
- Email verification field
- Profile picture URL
- Preferred language
- Notification preferences
- Parent-child relationship table (many-to-many)
- Student performance tracking
- Parent dashboard preferences

### Indexing Recommendations
Consider adding indexes for:
- `idNumber` - For quick student lookup
- `childrenMatricules` - For parent-child queries (GIN index for JSON array)
- `gradeId` + `seriesId` - For filtering students by level

## Testing Checklist

- [x] Schema compiles without errors
- [x] Migration generates successfully
- [x] Zod schemas validate correctly
- [x] Student form submits with all fields
- [x] Parent form submits with children matricules
- [ ] Migration applies to database
- [ ] Forms integrate with backend API
- [ ] Data persists correctly
- [ ] Validation errors display properly
