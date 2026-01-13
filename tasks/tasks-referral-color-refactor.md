# Tasks: Referral Screen Inline Color Refactoring

## Relevant Files

- `apps/user-application/src/routes/_auth/app/referrals.tsx`
- `apps/user-application/src/components/referrals/share-card.tsx`
- `apps/user-application/src/index.css` (for checking theme variables)
- `tailwind.config.ts` (for checking theme configuration)

## Instructions

Check off tasks as you go.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout branch `fix/referral-inline-colors`
- [x] 1.0 Analyze and Map Colors
  - [x] 1.1 Inspect `apps/user-application/src/routes/_auth/app/referrals.tsx` for hardcoded colors.
  - [x] 1.2 Inspect `apps/user-application/src/components/referrals/share-card.tsx` for hardcoded colors.
  - [x] 1.3 Inspect `apps/user-application/src/components/referrals/referral-stats.tsx` for hardcoded colors.
  - [x] 1.4 Map identified colors to existing Tailwind classes or CSS variables.
- [x] 2.0 Refactor Styling
  - [x] 2.1 Replace hardcoded colors in `referrals.tsx` with theme classes.
  - [x] 2.2 Replace hardcoded colors in `share-card.tsx` with theme classes.
  - [x] 2.3 Replace hardcoded colors in `referral-stats.tsx` with theme classes.
- [x] 3.0 Verification
  - [x] 3.1 Verify visual consistency.
  - [x] 3.2 Ensure no regression.
