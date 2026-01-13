# PRD: Fix Achievement Flash on Session Summary

## Introduction/Overview

Currently, when a user unlocks an achievement at the end of a session, the achievement notification appears briefly ("flashes") on the Session screen just before the user is navigated to the Summary screen. This creates a jarring experience where the user misses the achievement celebration.
The desired behavior is to suppress this flash on the Session screen and instead display the achievement notification on the Summary screen, after a short delay to allow the UI to stabilize.

## Goals

1. **Eliminate "Flash":** Prevent the achievement notification from appearing on the `SessionPage` when the session is completing.
2. **Delayed Display:** Show the achievement notification on the `SummaryPage` after a 500ms-1s delay.
3. **Data Passing:** Successfully pass the list of newly unlocked achievements from the session to the summary page.
4. **Consistency:** Ensure that viewing the achievement on the summary page marks it as "seen" so it doesn't reappear on the Progress page (referencing the previous fix).

## User Stories

- **As a learner**, I want to finish my session and see my results summary first.
- **As a learner**, I want to be pleasantly surprised by an achievement notification *after* I've had a moment to breathe, not while the screen is changing.

## Functional Requirements

1. **Session Page (`lesson-session.$lessonId.tsx`):**
    - The `onAchievementUnlocked` callback in `useStatsUpdate` must be suppressed or ignored when the update is triggered by `navigateToSummary`.
    - The `navigateToSummary` function must capture the `achievementsUnlocked` from the `updateStats` result.
    - The `achievementsUnlocked` (IDs or names) must be passed as a query parameter (e.g., `&achievements=...`) to the Summary page URL.

2. **Summary Page (`lesson-summary.$lessonId.tsx`):**
    - Accept an optional `achievements` query parameter (string, likely comma-separated).
    - Implement a `useEffect` that triggers the display of these achievements after a set delay (e.g., 800ms).
    - Use the `AchievementUnlockToast` (or similar component) to display the achievements.
    - **Crucial:** When displaying these achievements, update the `localStorage` "seen" list (using the logic from the recent fix) to prevent them from showing up again on the generic Progress page.

## Technical Considerations

- **URL Length:** Achievement IDs are strings. Passing 1-3 IDs in the URL is safe.
- **Component Reuse:** Reuse `AchievementUnlockToast` from `components/gamification/achievement-unlock-toast.tsx`.
- **State Management:** Use `useState` in Summary Page to control the visibility of the toast.

## Acceptance Criteria

- [ ] Completing a session with a new achievement does NOT show the toast on the Session page.
- [ ] The Summary page loads fully.
- [ ] After ~1 second, the Achievement Toast appears on the Summary page.
- [ ] Dismissing the toast (or auto-dismiss) works as expected.
- [ ] Navigating to the Progress page afterwards does NOT show the same achievement again.

## Open Questions

- *None at this stage.*
