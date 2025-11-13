# Quick Start: Profile Implementation

Get the profile completion flow running in 5 minutes.

## Prerequisites

- PostgreSQL database running
- Environment variables configured:
  - `DATABASE_HOST`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`

## Step 1: Generate Migrations

```bash
cd packages/data-ops
pnpm run drizzle:generate
```

This will create migration files in `packages/data-ops/src/drizzle/` based on the schema.

## Step 2: Apply Migrations

```bash
pnpm run drizzle:migrate
```

This applies the migrations to your database, creating all tables.

## Step 3: Seed the Database

```bash
# Build the package first
pnpm run build:data-ops

# Run the seeding script
node packages/data-ops/dist/database/seed-db.js
```

This populates the database with:
- 13 grades (CP1 through Tle)
- 4 series (A, C, D, E)
- 12 subjects
- 150+ subject offerings

## Step 4: Start the App

```bash
# From project root
pnpm run dev:kurama-frontend
```

## Step 5: Test the Flow

1. Navigate to `http://localhost:3000`
2. Sign in with Google OAuth
3. You'll be redirected to `/onboarding`
4. Select "Student" or "Parent"
5. Complete the profile form
6. You'll be redirected to `/app`

## Verify Database

```sql
-- Check grades
SELECT * FROM grades ORDER BY display_order;

-- Check series
SELECT * FROM series ORDER BY display_order;

-- Check subjects
SELECT * FROM subjects ORDER BY display_order;

-- Check user profiles
SELECT * FROM user_profiles;
```

## Common Issues

### "Database not initialized" error
**Solution**: Make sure environment variables are set and database is running.

### "Cannot find module" errors
**Solution**: Run `pnpm run build:data-ops`

### Migrations fail
**Solution**: Check database connection string and permissions.

### Seeding fails with "duplicate key"
**Solution**: Database already seeded. Drop tables or skip seeding.

## File Structure

```
packages/data-ops/
├── src/
│   ├── drizzle/
│   │   ├── schema.ts          # ✅ Database schema
│   │   ├── seed.ts            # ✅ Seed data
│   │   └── auth-schema.ts     # Existing auth tables
│   ├── database/
│   │   ├── setup.ts           # ✅ Updated with schema
│   │   └── seed-db.ts         # ✅ Seeding script
│   └── zod-schema/
│       └── profile.ts         # ✅ Validation schemas

apps/user-application/
├── src/
│   ├── core/
│   │   └── functions/
│   │       └── profile.ts     # ✅ Server functions
│   ├── components/
│   │   └── onboarding/
│   │       ├── UserTypeSelection.tsx      # ✅
│   │       ├── StudentProfileForm.tsx     # ✅
│   │       ├── ParentProfileForm.tsx      # ✅
│   │       └── index.ts                   # ✅
│   └── routes/
│       ├── onboarding.tsx     # ✅ Onboarding route
│       └── _auth/
│           └── route.tsx      # ✅ Updated with guard
```

## Next Steps

1. **Customize the UI**: Update colors, fonts, and styling
2. **Add more fields**: Extend profile forms as needed
3. **Create profile page**: Allow users to edit their profile
4. **Add analytics**: Track onboarding completion rates
5. **Implement lessons**: Start building educational content

## Testing Checklist

- [ ] New user sees onboarding
- [ ] Student form works
- [ ] Parent form works
- [ ] Series shows only for Lycée
- [ ] Profile saves correctly
- [ ] Redirect to app works
- [ ] Returning user bypasses onboarding
- [ ] Back button works
- [ ] Form validation works
- [ ] Loading states display

## Support

See `PROFILE_IMPLEMENTATION.md` for detailed documentation.

## Summary

You now have:
- ✅ Complete database schema
- ✅ Seeded educational data
- ✅ Multi-step onboarding flow
- ✅ Profile completion guard
- ✅ Server functions for profile management
- ✅ Type-safe validation

The profile system is production-ready and can be extended as needed!
