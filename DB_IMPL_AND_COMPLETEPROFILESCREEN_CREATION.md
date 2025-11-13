As a senior prompt engineer, I will now construct a detailed, systematic prompt to guide an AI assistant in performing this task. This prompt is designed to be executed by an advanced coding assistant to ensure accuracy and adherence to your project's architecture.

***

### **Prompt for AI Assistant**

**Persona:** You are a senior full-stack developer with expertise in the T3 stack, specifically TanStack Start, Drizzle ORM (PostgreSQL), Zod, Tailwind CSS, and Better Auth. You are tasked with implementing a complete user profile and onboarding flow for the "Kurama" application.

**Context:** The "Kurama" project is a web-based, mobile-first clone of a React Native application named "Jeviz". The goal is to replicate the database structure and profile completion logic from Jeviz, adapting it to Kurama's tech stack and project structure. You have been provided with the full file structure and an analysis of the Jeviz schema and profile completion flow.

**Primary Objective:** Implement the full database schema for educational content and user profiles, and then build the multi-step "Complete Profile" screen that new users must finish before accessing the main application.

---

### **Phase 1: Database Schema and Seeding**

Your first task is to define the complete database schema in the `data-ops` package.

**Step 1: Create the Main Schema File**

1.  In the `packages/data-ops/src/drizzle/` directory, create a new file named `schema.ts`.
2.  This file will contain all the tables *except* for the authentication tables (which are already in `auth-schema.ts`).
3.  Use Drizzle ORM with the `pgTable` helper from `drizzle-orm/pg-core`, as this project uses PostgreSQL.

**Step 2: Implement the Schema**

Translate the provided Jeviz schema structure into Drizzle syntax for PostgreSQL. Create the following tables in `packages/data-ops/src/drizzle/schema.ts`:

1.  **`grades`**:
    *   `id`: `serial('id').primaryKey()`
    *   `name`: `text('name').notNull().unique()`(e.g., 'CP1', 'CP2', ... 6ème, 5ème, ... Tle)
    *   `slug`: `text('slug').notNull().unique()`
    *   `isActive`: `boolean('is)active').default(true).notNull()`
    *   `category`: `text('category').notNull()` (e.g., 'PRIMARY', 'COLLEGE', 'LYCEE')
    *   `displayOrder`: `integer('display_order').notNull()`

2.  **`series`**:
    *   `id`: `serial('id').primaryKey()`
    *   `name`: `text('name').notNull().unique()`
    *   `description`: `text('description')`
    *   `displayOrder`: `integer('display_order').notNull()`

3.  **`levelSeries`** (Junction Table):
    *   `gradeId`: `integer('grade_id').notNull().references(() => grades.id, { onDelete: 'cascade' })`
    *   `seriesId`: `integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' })`
    *   Define a composite primary key on `gradeId` and `seriesId`.

4.  **`subjects`**:
    *   `id`: `serial('id').primaryKey()`
    *   `name`: `text('name').notNull().unique()`
    *   `abbreviation`: `text('abbreviation').notNull().unique()`
    *   `description`: `text('description')`
    *   `displayOrder`: `integer('display_order').notNull()`

5.  **`subjectOfferings`** (Junction Table):
    *   `gradeId`: `integer('grade_id').notNull()`
    *   `subjectId`: `integer('subject_id').notNull()`
    *   `seriesId`: `integer('series_id')`
    *   `isMandatory`: `boolean('is_mandatory').default(true).notNull()`
    *   `coefficient`: `integer('coefficient').default(1)`

6.  **`lessons`**:
    *   `id`: `serial('id').primaryKey()`
    *   `subjectId`: `integer('subject_id').notNull()`
    *   `title`: `text('title').notNull()`
    *   `authorId`: `text('author_id')`
    *   ...and all other relevant columns from the Jeviz schema.

7.  **`cards`**:
    *   `id`: `serial('id').primaryKey()`
    *   `lessonId`: `integer('lesson_id').notNull()`
    *   `frontContent`: `text('front_content').notNull()`
    *   ...and all other columns.

8.  **`user_profiles`**:
    *   This is the most critical table for this task.
    *   `userId`: `text('user_id').primaryKey().references(() => auth_user.id, { onDelete: 'cascade' })`
    *   `userType`: `text('user_type', { enum: ['student', 'parent'] }).notNull()`
    *   `firstName`: `text('first_name').notNull()`
    *   `lastName`: `text('last_name').notNull()`
    *   `gradeId`: `integer('grade_id').references(() => grades.id, { onDelete: 'set null' })`
    *   `seriesId`: `integer('series_id').references(() => series.id, { onDelete: 'set null' })`
    *   `childrenCount`: `integer('children_count')`
    *   `isCompleted`: `boolean('is_completed').default(false).notNull()`
    *   Add `createdAt` and `updatedAt` timestamps.

9.  **`user_progress`** and **`study_sessions`**: Implement these tables following the Jeviz structure, ensuring foreign keys reference the appropriate tables (`users`, `lessons`, `cards`).

10. **Define Relations**: Use Drizzle's `relations` helper to define relationships between all tables. This is crucial for querying.

11. **Export Types**: At the end of the file, export all `Select` and `Insert` types for each table (e.g., `export type SelectGrade = typeof grades.$inferSelect;`).

**Step 3: Create Seed Data**

1.  Create a new file `packages/data-ops/src/drizzle/seed.ts`.
2.  Copy the seed data constants (`GRADES`, `SERIES`, `SUBJECTS`, etc.) from `jeviz/src/lib/database/seed.ts` into this new file. Ensure the data structures match your new schema types.

---

### **Phase 2: Backend Logic (Server Functions)**

Now, create the server-side logic to handle profile data.

1.  **Create Profile Functions File**: In `apps/user-application/src/core/functions/`, create a new file named `profile.ts`.
2.  **`getProfileStatus` Function**:
    *   Create a `protected` server function using `createServerFn().middleware([protectedFunctionMiddleware])`.
    *   This function should query the `user_profiles` table using the `userId` from the middleware context.
    *   It should return an object like `{ isCompleted: boolean }`.
3.  **`getEducationalData` Function**:
    *   Create a `protected` server function.
    *   It should query and return all `grades` and `series` from the database. This will be used to populate the form dropdowns.
4.  **`submitProfile` Function**:
    *   Create a `protected` server function.
    *   Use Zod to validate the incoming data. Create a corresponding schema file in `packages/data-ops/src/zod-schema/profile.ts`.
    *   The function will receive the complete profile data.
    *   It should perform an `insert` or `update` (`onConflictDoUpdate`) operation on the `user_profiles` table for the current `userId`.
    *   Ensure you convert string-based level/series names from the form back to their corresponding IDs before saving.
    *   Set `isCompleted` to `true`.

---

### **Phase 3: Frontend UI/UX and Logic**

Finally, build the user-facing components for the profile completion flow.

**Step 1: Create the Main Onboarding Route & Component**

1.  Create a new route file at `apps/user-application/src/routes/onboarding.tsx`.
2.  Inside, create a `CompleteProfileScreen` component that manages the state of the multi-step flow (`'userType'`, `'form'`).

**Step 2: Implement UI Components**

Create the following reusable components inside `apps/user-application/src/components/onboarding/`:

1.  **`UserTypeSelection.tsx`**:
    *   Presents two large, clickable cards for "Student" and "Parent".
    *   Use Shadcn's `<Card>` and `<Button>` components.
    *   When a type is selected, it calls a prop function (`onSelect`) to update the parent state in `CompleteProfileScreen`.
2.  **`StudentProfileForm.tsx`**:
    *   A form with inputs for first name, last name, educational level, and series.
    *   Use TanStack Query's `useQuery` to fetch the educational data using the `getEducationalData` server function you created.
    *   The "Series" dropdown should only appear conditionally if a "Lycée" level is selected.
    *   Use Shadcn components for the UI (`<Input>`, `<Label>`, `<Button>`, and a custom `<Select>` if needed for the dropdowns).
3.  **`ParentProfileForm.tsx`**:
    *   A simpler form for first name, last name, and optional children count.

**Step 3: Implement the Profile Completion Guard**

1.  Modify the layout route that protects the main application, likely `apps/user-application/src/routes/_auth/app/route.tsx`.
2.  Inside this component, use TanStack Query's `useQuery` to call your `getProfileStatus` server function.
3.  While the query is loading, render a full-screen loading spinner.
4.  Once the data is available:
    *   If `isCompleted` is `false`, use TanStack Router's `<Navigate to="/onboarding" />` component to redirect the user.
    *   If `isCompleted` is `true`, render the `<Outlet />` to show the main application.

This structured approach ensures that the database is correctly set up before the UI is built, and the final logic is secure and efficient, leveraging the existing architecture of the "Kurama" project. Execute these steps sequentially.
