# PRD: Fix Always Achievement Unlocked Dialog

## Introduction/Overview

Currently, users see the "Achievement Unlocked" dialog every time they visit the progress page, even for achievements they have already seen. This creates a repetitive and annoying user experience. This PRD defines the fix to ensure only *genuinely new* achievements trigger the notification.

## Goals

1. Prevent the "Achievement Unlocked" dialog from appearing for achievements the user has already seen.
2. Ensure the dialog *does* appear when a new achievement is unlocked.
3. Persist the "seen" state across sessions using `localStorage`.

## User Stories

- **As a user**, I want to see a celebration when I unlock a new achievement so I feel rewarded.
- **As a user**, I DO NOT want to see the same celebration again when I refresh the page or return later, because it loses its meaning.

## Functional Requirements

1. **LocalStorage Persistence:** The application must store a list of `seen_achievement_ids` in the browser's `localStorage`.
2. **Filtering Logic:** On page load, the application must compare the `newlyUnlocked` achievements returned by the API against the stored `seen_achievement_ids`.
3. **Display Condition:** The dialog must only display achievements that are present in `newlyUnlocked` AND NOT present in `seen_achievement_ids`.
4. **State Update:** Once filtering is complete and new achievements are identified for display, their IDs must be added to `localStorage` to prevent future displays.

## Technical Considerations

- **Storage Key:** Use a unique key like `kurama_seen_achievements_${userId}` to support multiple users on the same device (if applicable) or just `kurama_seen_achievements`. Given the auth context, appending userId is safer.
- **Data Structure:** simple JSON array of strings: `['achievement-1', 'achievement-2']`.
- **Component:** `apps/user-application/src/routes/_auth/app/progress.tsx` is the primary target.

## Acceptance Criteria

- [ ] Visiting the progress page with *no* new achievements shows NO dialog.
- [ ] Visiting the progress page with a *new* achievement shows the dialog ONCE.
- [ ] Refreshing the page immediately after seeing the dialog does NOT show it again.
- [ ] The "seen" state persists if the user closes and reopens the browser.

## Open Questions

- Should we ever clear this list? (Likely not needed for now, as achievements are finite).
- What if the user clears their cache? (They will see the notification again once, which is acceptable).
