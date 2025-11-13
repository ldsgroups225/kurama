# Architecture Diagram: Profile Implementation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         KURAMA PLATFORM                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Sign In    │───▶│ Auth Guard   │───▶│  Onboarding  │     │
│  │  (Google)    │    │  (Profile    │    │    Flow      │     │
│  └──────────────┘    │   Check)     │    └──────────────┘     │
│                      └──────┬───────┘                           │
│                             │                                    │
│                    ┌────────┴────────┐                          │
│                    │                 │                          │
│              Complete          Incomplete                        │
│                    │                 │                          │
│                    ▼                 ▼                          │
│            ┌──────────────┐  ┌──────────────┐                  │
│            │  Main App    │  │  User Type   │                  │
│            │  Dashboard   │  │  Selection   │                  │
│            └──────────────┘  └──────┬───────┘                  │
│                                     │                           │
│                            ┌────────┴────────┐                 │
│                            │                 │                 │
│                        Student           Parent                │
│                            │                 │                 │
│                            ▼                 ▼                 │
│                    ┌──────────────┐  ┌──────────────┐         │
│                    │   Student    │  │   Parent     │         │
│                    │  Profile     │  │   Profile    │         │
│                    │    Form      │  │    Form      │         │
│                    └──────┬───────┘  └──────┬───────┘         │
│                           │                 │                  │
│                           └────────┬────────┘                  │
│                                    │                           │
│                                    ▼                           │
│                           ┌──────────────┐                     │
│                           │   Submit     │                     │
│                           │   Profile    │                     │
│                           └──────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SERVER FUNCTIONS LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ getProfileStatus │  │ getEducationalData│                    │
│  │                  │  │                  │                    │
│  │ Returns:         │  │ Returns:         │                    │
│  │ - isCompleted    │  │ - grades[]       │                    │
│  │ - hasProfile     │  │ - series[]       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  submitProfile   │  │  getUserProfile  │                    │
│  │                  │  │                  │                    │
│  │ Validates &      │  │ Returns:         │                    │
│  │ Saves Profile    │  │ - Full profile   │                    │
│  │                  │  │ - With relations │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  All functions protected by: protectedFunctionMiddleware        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       VALIDATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Zod Schemas                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  userTypeSchema: "student" | "parent"                    │  │
│  │                                                           │  │
│  │  studentProfileSchema:                                   │  │
│  │    - userType: "student"                                 │  │
│  │    - firstName: string (2-50 chars)                      │  │
│  │    - lastName: string (2-50 chars)                       │  │
│  │    - gradeName: string (required)                        │  │
│  │    - seriesName: string (optional)                       │  │
│  │                                                           │  │
│  │  parentProfileSchema:                                    │  │
│  │    - userType: "parent"                                  │  │
│  │    - firstName: string (2-50 chars)                      │  │
│  │    - lastName: string (2-50 chars)                       │  │
│  │    - childrenCount: number (1-20, optional)              │  │
│  │                                                           │  │
│  │  profileSchema: Discriminated Union                      │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Educational Structure Tables               │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  grades (13 rows)                                       │    │
│  │  ├─ id, name, slug, category, displayOrder             │    │
│  │  └─ PRIMARY (6), COLLEGE (4), LYCEE (3)                │    │
│  │                                                         │    │
│  │  series (4 rows)                                        │    │
│  │  ├─ id, name, description, displayOrder                │    │
│  │  └─ A, C, D, E                                          │    │
│  │                                                         │    │
│  │  levelSeries (12 rows)                                  │    │
│  │  ├─ gradeId, seriesId                                   │    │
│  │  └─ Links Lycée levels to series                       │    │
│  │                                                         │    │
│  │  subjects (12 rows)                                     │    │
│  │  ├─ id, name, abbreviation, description                │    │
│  │  └─ MATH, FR, ANG, PC, SVT, HG, etc.                   │    │
│  │                                                         │    │
│  │  subjectOfferings (150+ rows)                           │    │
│  │  ├─ gradeId, subjectId, seriesId                        │    │
│  │  ├─ isMandatory, coefficient                            │    │
│  │  └─ Defines curriculum                                  │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Content Tables                         │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  lessons                                                │    │
│  │  ├─ id, subjectId, title, description                   │    │
│  │  ├─ authorId, difficulty, estimatedDuration            │    │
│  │  └─ isPublished, publishedAt, timestamps               │    │
│  │                                                         │    │
│  │  cards                                                  │    │
│  │  ├─ id, lessonId, frontContent, backContent            │    │
│  │  ├─ cardType, difficulty, displayOrder                 │    │
│  │  └─ metadata, timestamps                               │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  User Data Tables                       │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  userProfiles                                           │    │
│  │  ├─ userId (PK, FK to auth_user)                       │    │
│  │  ├─ userType: "student" | "parent"                     │    │
│  │  ├─ firstName, lastName                                 │    │
│  │  ├─ gradeId (FK to grades)                             │    │
│  │  ├─ seriesId (FK to series)                            │    │
│  │  ├─ childrenCount                                       │    │
│  │  ├─ isCompleted                                         │    │
│  │  └─ timestamps                                          │    │
│  │                                                         │    │
│  │  userProgress                                           │    │
│  │  ├─ id, userId, cardId, lessonId                       │    │
│  │  ├─ easeFactor, interval, repetitions                  │    │
│  │  ├─ lastReviewedAt, nextReviewAt                       │    │
│  │  ├─ totalReviews, correctReviews                       │    │
│  │  └─ timestamps (SM-2 algorithm)                        │    │
│  │                                                         │    │
│  │  studySessions                                          │    │
│  │  ├─ id, userId, lessonId                               │    │
│  │  ├─ startedAt, endedAt, duration                       │    │
│  │  ├─ cardsReviewed, cardsCorrect                        │    │
│  │  └─ createdAt                                           │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Authentication Tables                      │    │
│  │              (Existing - Better Auth)                   │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  auth_user, auth_session, auth_account,                │    │
│  │  auth_verification                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE COMPLETION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. User Authentication
   ┌──────────┐
   │  User    │
   │ Signs In │
   └────┬─────┘
        │
        ▼
   ┌──────────────┐
   │ Better Auth  │
   │  Creates     │
   │  Session     │
   └────┬─────────┘
        │
        ▼

2. Profile Status Check
   ┌──────────────────┐
   │  Auth Guard      │
   │  Calls:          │
   │  getProfileStatus│
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Query Database  │
   │  SELECT * FROM   │
   │  user_profiles   │
   │  WHERE userId=?  │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Return Status   │
   │  {isCompleted:   │
   │   true/false}    │
   └────┬─────────────┘
        │
        ├─────────────┬─────────────┐
        │             │             │
   isCompleted   isCompleted   No Profile
     = true        = false        Found
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌──────────┐  ┌──────────┐
   │  Show  │   │ Redirect │  │ Redirect │
   │  App   │   │   to     │  │   to     │
   │        │   │Onboarding│  │Onboarding│
   └────────┘   └──────────┘  └──────────┘

3. Onboarding Flow
   ┌──────────────────┐
   │  User Type       │
   │  Selection       │
   └────┬─────────────┘
        │
        ├─────────────┬─────────────┐
        │             │             │
    Student        Parent          │
        │             │             │
        ▼             ▼             │
   ┌──────────┐  ┌──────────┐     │
   │ Student  │  │ Parent   │     │
   │  Form    │  │  Form    │     │
   └────┬─────┘  └────┬─────┘     │
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
   ┌──────────────────────────────┐
   │  Form Submission             │
   │  Calls: submitProfile        │
   └────┬─────────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  Validate with Zod           │
   │  - Check required fields     │
   │  - Validate formats          │
   │  - Check constraints         │
   └────┬─────────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  Convert Names to IDs        │
   │  - gradeName → gradeId       │
   │  - seriesName → seriesId     │
   └────┬─────────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  Save to Database            │
   │  INSERT INTO user_profiles   │
   │  ON CONFLICT DO UPDATE       │
   │  SET isCompleted = true      │
   └────┬─────────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  Redirect to App             │
   │  navigate({ to: "/app" })    │
   └──────────────────────────────┘
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT TREE                              │
└─────────────────────────────────────────────────────────────────┘

App
└── Router
    ├── /_auth (Auth Layout)
    │   ├── Auth Guard
    │   │   ├── useQuery(getProfileStatus)
    │   │   └── Conditional Rendering
    │   │       ├── Loading Spinner
    │   │       ├── <Navigate to="/onboarding" />
    │   │       └── <Outlet /> (Main App)
    │   │
    │   └── /app/* (Protected Routes)
    │       ├── /app/index (Dashboard)
    │       ├── /app/lessons
    │       ├── /app/progress
    │       └── /app/profile
    │
    └── /onboarding (Onboarding Route)
        └── OnboardingPage
            ├── State Management
            │   ├── step: "userType" | "form"
            │   └── selectedUserType: UserType | null
            │
            ├── Step 1: UserTypeSelection
            │   ├── Student Card
            │   │   └── onClick → setUserType("student")
            │   └── Parent Card
            │       └── onClick → setUserType("parent")
            │
            └── Step 2: Profile Form
                ├── StudentProfileForm
                │   ├── useQuery(getEducationalData)
                │   ├── useMutation(submitProfile)
                │   ├── Form Fields
                │   │   ├── firstName (Input)
                │   │   ├── lastName (Input)
                │   │   ├── gradeName (Select)
                │   │   └── seriesName (Select - conditional)
                │   └── Submit Button
                │
                └── ParentProfileForm
                    ├── useMutation(submitProfile)
                    ├── Form Fields
                    │   ├── firstName (Input)
                    │   ├── lastName (Input)
                    │   └── childrenCount (Input - optional)
                    └── Submit Button
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────┘

auth_user (1) ──────────────────────────────────┐
    │                                            │
    │ 1:1                                        │ 1:N
    │                                            │
    ▼                                            ▼
userProfiles                              userProgress
    │                                            │
    │ N:1                                        │ N:1
    │                                            │
    ├──────────▶ grades (1)                     ├──────────▶ cards (1)
    │                │                           │                │
    │                │ 1:N                       │                │ N:1
    │                │                           │                │
    │                ▼                           │                ▼
    │           levelSeries                      │            lessons (1)
    │                │                           │                │
    │                │ N:1                       │                │ N:1
    │                │                           │                │
    └──────────▶ series (1)                     │                ▼
                                                 │            subjects (1)
                                                 │                │
                                                 │                │ 1:N
                                                 │                │
                                                 │                ▼
                                                 │         subjectOfferings
                                                 │                │
                                                 │                │ N:1
                                                 │                │
                                                 │                ├──────────▶ grades
                                                 │                │
                                                 │                └──────────▶ series
                                                 │
                                                 └──────────▶ lessons (1)

auth_user (1) ────────────────────────────────────────────────────┐
    │                                                              │
    │ 1:N                                                          │ 1:N
    │                                                              │
    ▼                                                              ▼
studySessions                                                 lessons
    │                                                              │
    │ N:1                                                          │ 1:N
    │                                                              │
    └──────────────────────────────────────────────────────────▶ cards
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

Frontend
├── Framework: TanStack Start (React SSR)
├── Router: TanStack Router (File-based)
├── State: TanStack Query (Server State)
├── Forms: React Hook Form (implied)
├── Validation: Zod
├── UI: Shadcn/ui + Radix UI
├── Styling: Tailwind CSS v4
└── Icons: Lucide React

Backend
├── Runtime: Cloudflare Workers
├── Framework: Hono
├── Auth: Better Auth
└── Payments: Polar SDK

Database
├── ORM: Drizzle ORM
├── Database: PostgreSQL
├── Migrations: Drizzle Kit
└── Providers: Neon / PlanetScale / SQLite

Validation
├── Schema: Zod
├── Type Safety: TypeScript
└── Runtime Validation: Zod parse

Build Tools
├── Package Manager: pnpm
├── Monorepo: pnpm workspaces
├── Build: Vite + TypeScript
└── Deployment: Wrangler (Cloudflare)
```

This architecture provides a solid foundation for the Kurama platform with clear separation of concerns, type safety throughout, and scalability for future features.
