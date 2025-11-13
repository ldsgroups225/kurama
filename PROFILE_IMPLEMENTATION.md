# Profile Implementation Guide

This document describes the complete implementation of the database schema and profile completion flow for Kurama.

## Overview

The implementation includes:
1. Complete database schema for educational content and user profiles
2. Multi-step onboarding flow for new users
3. Profile completion guard to ensure users complete their profile before accessing the app
4. Server functions for profile management
5. Seed data for educational structure (grades, series, subjects)

## Database Schema

### Tables Created

#### Educational Structure
- **`grades`** - Educational levels (CP1, CP2, 6ème, 5ème, Tle, etc.)
- **`series`** - Lycée specializations (A, C, D, E)
- **`levelSeries`** - Junction table linking grades to available series
- **`subjects`** - Academic subjects (Mathématiques, Français, etc.)
- **`subjectOfferings`** - Which subjects are available for which grade/series combinations

#### Content
- **`lessons`** - Educational lessons linked to subjects
- **`cards`** - Flashcards for spaced repetition learning

#### User Data
- **`userProfiles`** - Extended user information (student/parent profiles)
- **`userProgress`** - SM-2 spaced repetition progress tracking
- **`studySessions`** - Study session history

### Files Created

```
packages/data-ops/src/
├── drizzle/
│   ├── schema.ts              # Main database schema
│   └── seed.ts                # Seed data constants
├── database/
│   ├── setup.ts               # Updated with schema imports
│   └── seed-db.ts             # Seeding script
└── zod-schema/
    └── profile.ts             # Profile validation schemas
```

## Server Functions

Created in `apps/user-application/src/core/functions/profile.ts`:

### `getProfileStatus()`
- Returns whether the user has completed their profile
- Used by the auth guard to redirect incomplete profiles

### `getEducationalData()`
- Fetches all grades and series for form dropdowns
- Used by the student profile form

### `submitProfile()`
- Validates and saves user profile data
- Handles both student and parent profiles
- Converts grade/series names to IDs

### `getUserProfile()`
- Fetches the current user's complete profile
- Includes related grade and series data

## UI Components

Created in `apps/user-application/src/components/onboarding/`:

### `UserTypeSelection.tsx`
- First step of onboarding
- Two large cards for Student/Parent selection
- Clean, intuitive design

### `StudentProfileForm.tsx`
- Form for student profile completion
- Fields: First name, Last name, Grade, Series (conditional)
- Series dropdown only appears for Lycée levels
- Real-time validation
- Loading states

### `ParentProfileForm.tsx`
- Form for parent profile completion
- Fields: First name, Last name, Children count (optional)
- Simpler than student form

## Routes

### `/onboarding`
- Main onboarding route
- Manages multi-step flow state
- Redirects to `/app` on completion

### `/_auth` (Updated)
- Added profile completion guard
- Checks profile status after authentication
- Redirects to `/onboarding` if profile incomplete
- Shows loading spinner during checks

## Setup Instructions

### 1. Generate Database Migrations

```bash
# Generate migration files from schema
pnpm run drizzle:generate --filter data-ops
```

### 2. Run Migrations

```bash
# Apply migrations to database
pnpm run drizzle:migrate --filter data-ops
```

### 3. Seed the Database

```bash
# Option 1: Run the seeding script directly
node packages/data-ops/dist/database/seed-db.js

# Option 2: Create a custom script in package.json
pnpm run seed:db
```

### 4. Build Data-Ops Package

```bash
# Build the package to make exports available
pnpm run build:data-ops
```

### 5. Start Development Server

```bash
# Start the frontend application
pnpm run dev:kurama-frontend
```

## User Flow

### New User Journey

1. **Authentication**
   - User signs in with Google OAuth
   - Session is created

2. **Profile Check**
   - Auth guard checks if profile is completed
   - If not completed, redirect to `/onboarding`

3. **User Type Selection**
   - User chooses between Student or Parent
   - Large, clear cards for selection

4. **Profile Form**
   - Student: First name, Last name, Grade, Series (if Lycée)
   - Parent: First name, Last name, Children count (optional)
   - Form validation with error messages

5. **Profile Submission**
   - Data validated with Zod
   - Grade/Series names converted to IDs
   - Profile saved with `isCompleted: true`

6. **Redirect to App**
   - User redirected to `/app`
   - Can now access full application

### Returning User Journey

1. **Authentication**
   - User signs in

2. **Profile Check**
   - Profile is completed
   - User goes directly to `/app`

## Data Structure

### Student Profile Example

```typescript
{
  userId: "user_123",
  userType: "student",
  firstName: "Aminata",
  lastName: "Koné",
  gradeId: 13,        // Tle
  seriesId: 2,        // C
  isCompleted: true
}
```

### Parent Profile Example

```typescript
{
  userId: "user_456",
  userType: "parent",
  firstName: "Kouadio",
  lastName: "Yao",
  childrenCount: 2,
  gradeId: null,
  seriesId: null,
  isCompleted: true
}
```

## Seed Data Summary

### Grades (13 levels)
- **Primary**: CP1, CP2, CE1, CE2, CM1, CM2
- **College**: 6ème, 5ème, 4ème, 3ème
- **Lycée**: 2nde, 1ère, Tle

### Series (4 specializations)
- **A**: Littéraire
- **C**: Scientifique
- **D**: Sciences Expérimentales
- **E**: Économique

### Subjects (12 subjects)
- Mathématiques, Français, Anglais
- Physique-Chimie, SVT
- Histoire-Géographie, Philosophie
- ECM, Espagnol, Allemand
- Économie, Comptabilité

### Subject Offerings
- ~150+ mappings defining which subjects are available for each grade/series
- Includes coefficients for each subject
- Mandatory vs optional subjects

## Validation

### Profile Validation Rules

**Student:**
- First name: 2-50 characters
- Last name: 2-50 characters
- Grade: Required, must exist in database
- Series: Required only for Lycée levels

**Parent:**
- First name: 2-50 characters
- Last name: 2-50 characters
- Children count: Optional, 1-20 if provided

## Security

- All server functions use `protectedFunctionMiddleware`
- User can only access/modify their own profile
- Profile data validated with Zod schemas
- SQL injection prevented by Drizzle ORM

## Performance

- Profile status cached with TanStack Query
- Educational data fetched once and cached
- Optimistic UI updates
- Loading states for all async operations

## Accessibility

- Keyboard navigation support
- ARIA labels on form fields
- Error messages announced to screen readers
- Focus management in multi-step flow
- High contrast colors

## Future Enhancements

### Phase 2
- [ ] Profile editing page
- [ ] Avatar upload
- [ ] Email verification requirement
- [ ] Parent-child account linking

### Phase 3
- [ ] Onboarding progress indicator
- [ ] Skip profile completion (with limitations)
- [ ] Social profile import
- [ ] Profile completion analytics

### Phase 4
- [ ] Multi-language support
- [ ] Custom grade/series for international users
- [ ] School/institution selection
- [ ] Teacher accounts

## Troubleshooting

### Profile not redirecting
- Check that `getProfileStatus` is being called
- Verify database connection
- Check browser console for errors

### Form validation errors
- Ensure data-ops package is built
- Check Zod schema exports
- Verify form data structure

### Database seeding fails
- Check database connection string
- Verify migrations are applied
- Check for duplicate data

### TypeScript errors
- Run `pnpm run build:data-ops`
- Restart TypeScript server
- Check import paths

## Testing

### Manual Testing Checklist

- [ ] New user can complete student profile
- [ ] New user can complete parent profile
- [ ] Series dropdown only shows for Lycée
- [ ] Form validation works correctly
- [ ] Back button returns to user type selection
- [ ] Profile completion redirects to app
- [ ] Returning user bypasses onboarding
- [ ] Loading states display correctly
- [ ] Error messages are clear

### Database Testing

```sql
-- Check if grades were seeded
SELECT COUNT(*) FROM grades;

-- Check if series were seeded
SELECT COUNT(*) FROM series;

-- Check if subjects were seeded
SELECT COUNT(*) FROM subjects;

-- Check user profiles
SELECT * FROM user_profiles;
```

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check the Kurama project structure documentation
4. Open an issue in the repository

## Summary

This implementation provides a complete, production-ready profile completion flow that:
- ✅ Enforces profile completion before app access
- ✅ Supports both student and parent user types
- ✅ Includes comprehensive educational data structure
- ✅ Uses proper validation and security
- ✅ Provides excellent UX with loading states and error handling
- ✅ Is fully typed with TypeScript
- ✅ Follows Kurama project conventions

The system is ready for backend integration and can be extended with additional features as needed.
