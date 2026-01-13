# Tasks: Fix Achievement Flash on Session Summary

## Relevant Files

- `apps/user-application/src/routes/_auth/app/lesson-session.$lessonId.tsx`
- `apps/user-application/src/routes/_auth/app/lesson-summary.$lessonId.tsx`
- `apps/user-application/src/components/gamification/achievement-unlock-toast.tsx`

## Instructions

Check off tasks as you go.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout branch `fix/achievement-flash`
- [x] 1.0 Modify Session Page Logic (`lesson-session`)
  - [x] 1.1 In `SessionPage`, add a ref or state `isNavigatingToSummary` to track when we are finishing.
  - [x] 1.2 Modify `useStatsUpdate` `onAchievementUnlocked` callback to return early if `isNavigatingToSummary` is true.
  - [x] 1.3 Update `navigateToSummary` to extract `achievementsUnlocked` (IDs) from the `updateStats` result.
  - [x] 1.4 Pass these IDs in the URL search params to the summary page (e.g. `achievements=id1,id2`).
- [x] 2.0 Modify Summary Page Logic (`lesson-summary`)
  - [x] 2.1 Update `validateSearch` to accept `achievements` (string or array).
  - [x] 2.2 Add `AchievementUnlockToast` component to the JSX.
  - [x] 2.3 Add `useEffect` to handle the delayed display logic (read params -> wait -> set state to show).
  - [x] 2.4 Implement `handleDismiss` that updates `localStorage` (copying logic from `progress.tsx`) to mark as seen.
- [x] 3.0 Verification
  - [x] 3.1 Verify no flash on session end.
  - [x] 3.2 Verify delayed appearance on summary.
  - [x] 3.3 Verify no duplicate on Progress page.
