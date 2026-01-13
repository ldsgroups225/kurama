# Tasks: Implement Back Button on Referral Screen

## Relevant Files

- `apps/user-application/src/routes/_auth/app/referrals.tsx`
- `apps/user-application/src/components/main/app-header.tsx` (Reference only)

## Instructions

Check off tasks as you go.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout branch `feat/referral-back-button`
- [x] 1.0 Implement Back Button
  - [x] 1.1 In `apps/user-application/src/routes/_auth/app/referrals.tsx`, update `AppHeader` props.
  - [x] 1.2 Set `showBackButton={true}`.
  - [x] 1.3 Implement `onBackClick` logic: Check if history exists to go back, otherwise navigate to `/app`. (Or rely on `..` if deemed sufficient, but PRD suggests determining strictly).
    - *Implementation detail:* Use `useRouter()` from `@tanstack/react-router`. Check `router.history.length`.
- [x] 2.0 Verification
  - [x] 2.1 Verify button appears.
  - [x] 2.2 Verify click action works.
