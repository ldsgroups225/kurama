# Tasks: Daily Streak Computation Fix

## Relevant Files

- `packages/data-ops/src/queries/streak.ts` - Core streak calculation logic to be updated.
- `apps/user-application/src/core/functions/daily-challenge.ts` - Daily challenge logic to be refactored.
- `apps/user-application/src/core/functions/stats.ts` - general session stats update logic.
- `packages/data-ops/src/queries/streak.test.ts` - New test file for streak logic verification.

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `pnpm dlx jest [optional/path/to/test/file]` to run tests (I'm using vitest).

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch `fix/daily-streak-computation`
- [x] 1.0 Update Core Streak Calculation Logic
  - [x] 1.1 Open `packages/data-ops/src/queries/streak.ts` and update `fetchStudyDates` query to filter for `endedAt` is not null AND `cardsReviewed > 0`.
  - [x] 1.2 Verify `getStreakData` and `calculateCurrentStreak` logic remains valid with this change.
- [x] 2.0 Refactor Daily Challenge Streak Logic
  - [x] 2.1 Replace custom streak calculation in `getDailyChallengeStatus` with `calculateCurrentStreak` from `streak.ts`.
  - [x] 2.2 Replace custom streak calculation in `completeDailyChallenge` with `calculateCurrentStreak` from `streak.ts` (or ensure consistency).
  - [x] 2.3 Ensure `daily-challenge.ts` imports the shared streak utility correctly.
- [x] 3.0 Verify Server-Side Session Completion Handlers
  - [x] 3.1 Check `updateSessionStats` in `apps/user-application/src/core/functions/stats.ts` to ensure streak bonuses are calculated correctly given the new "completion-only" rule.
  - [x] 3.2 Ensure `updateLongestStreakIfNeeded` is called at the correct time (after completion).
- [x] 4.0 Testing & Validation
  - [x] 4.1 Create `packages/data-ops/src/queries/streak.test.ts` with comprehensive test cases.
  - [x] 4.2 Run tests using `pnpm test` (or `vitest`).
