# Tasks: Fix Always Achievement Unlocked Dialog

## Relevant Files

- `apps/user-application/src/routes/_auth/app/progress.tsx` - Main component to modify.

## Instructions for Completing Tasks

Checks off tasks as you go.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout branch `fix/achievement-dialog-loop`
- [x] 1.0 Implement LocalStorage Filtering in Progress Page
  - [x] 1.1 In `ProgressPage` component, add logic to read seen achievements from `localStorage` on mount.
  - [x] 1.2 Modify the `useEffect` handling `newlyUnlocked` to filter out IDs already in `localStorage`.
  - [x] 1.3 Update the `localStorage` with the new IDs immediately when they are set to be displayed (or when dismissed, but immediate is safer to avoid loops).
- [x] 2.0 Testing & Verification
  - [x] 2.1 specific manual verification steps (since this is client-side interaction).
