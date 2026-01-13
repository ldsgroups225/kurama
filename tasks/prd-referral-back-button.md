# PRD: Implement Back Button on Referral Screen

## Introduction/Overview

The Referral Screen (`/app/referrals`) currently lacks a dedicated way to navigate back to the previous view. Users are forced to rely on the browser's back button. This task aims to add a dedicated "Back" button to the Referral Screen header to improve navigation and user experience.

## Goals

1. Add a visible "Back" button to the `ReferralsPage`.
2. ensure the button navigates back in history if possible, or falls back to the Dashboard (`/app`).
3. Maintain design consistency by reusing the existing `AppHeader` back button functionality.

## User Stories

- **As a user**, I want to easily return to where I came from after checking my referral code, without reaching for the browser controls.
- **As a user**, I expect the back button to take me to the Dashboard if I opened the referral link directly.

## Functional Requirements

1. **UI Component:** Enable the `showBackButton` prop on the `AppHeader` component in `ReferralsPage`.
2. **Navigation Logic:**
    - Primary: Go back one step in history (`router.history.back()` or equivalent).
    - Fallback: If no history (e.g. new tab), navigate to `/app` (Dashboard).
    - *Note on AppHeader:* The default `AppHeader` behavior uses `navigate({ to: '..' })`. We need to verify if this is sufficient or if we need a custom handler. `..` from `/app/referrals` goes to `/app`, which is a safe default. However, strictly speaking, "Back" implies `history.back()`.

## Technical Considerations

- **File:** `apps/user-application/src/routes/_auth/app/referrals.tsx`
- **Component:** `AppHeader` from `@/components/main`
- **Router:** `@tanstack/react-router`

## Acceptance Criteria

- [ ] A "Back" arrow icon button appears on the left side of the Referral Screen header.
- [ ] Clicking the button navigates the user to the previous screen (e.g., Dashboard).
- [ ] The button matches the design of other headers (e.g., Profile, Lesson Session).

## Open Questions

- *None.*
