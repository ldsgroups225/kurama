# PRD: Daily Streak Computation Fix

## Introduction/Overview

The current streak system in Kurama increments a user's daily streak as soon as a learning session is initiated. This leads to inaccurate engagement metrics, as abandoned sessions are counted as active study days. This document outlines the requirements to shift the streak increment trigger to the successful *completion* of a session.

## Goals

1. Ensure daily streaks only increment when a user successfully finishes a learning activity.
2. Maintain a "single source of truth" for streak calculations across the platform.
3. Prevent duplicate streak increments within the same calendar day (idempotency).
4. Provide immediate visual feedback to the user when a streak is updated.

## User Stories

- **As a student**, I want my streak to reflect my actual study effort, not just the fact that I clicked a "Start" button.
- **As a student**, I want to see my streak fire up *after* I finish my session as a reward for my hard work.
- **As a developer**, I want a unified utility that handles streak logic so I don't have to duplicate the same math in different modules.

## Functional Requirements

1. **Completion Trigger:** The streak logic must only consider sessions where `endedAt` is not null and `cardsReviewed` is greater than 0.
2. **Unified Logic:** The `packages/data-ops/src/queries/streak.ts` utility must be updated to filter sessions by completion status.
3. **Consolidation:** The custom "consecutive days" logic in `daily-challenge.ts` should be replaced with calls to the centralized `streak.ts` utility.
4. **Retroactive Correction:** The streak calculation must dynamically reflect completed sessions from history, effectively "cleaning" historical data that contained abandoned sessions.
5. **UI Update:** The frontend must wait for the `updateSessionStats` callback (which confirms the streak state) before updating the displayed streak count.

## Non-Goals (Out of Scope)

- Implementing "Streak Freeze" logic (this is handled separately).
- Changing the definition of a calendar day (remains Africa/Abidjan timezone).
- Adding complex performance-based streak modifiers (XP bonuses remain as-is).

## Technical Considerations

- **Query Modification:** In `fetchStudyDates` (streak.ts), add a condition: `isNotNull(studySessions.endedAt)` and `gt(studySessions.cardsReviewed, 0)`.
- **Database Schema:** Confirm `study_sessions` has the `endedAt` field properly indexed alongside `userId` for performance.
- **Server Functions:** Ensure `updateSessionStats` in `stats.ts` and `completeDailyChallenge` in `daily-challenge.ts` both return the updated streak result.

## Success Metrics

- 100% of streak increments are tied to a session with a valid `endedAt` timestamp.
- Reduction in "ghost streaks" (users with streaks but zero total card reviews).
- Successful consolidation of streak logic into a single package.

## Open Questions

1. Should we add a minimum duration (e.g., sessions < 10 seconds)? *Decision: Not for MVP, `cardsReviewed > 0` is sufficient.*
2. How to handle sessions that span across midnight? *Decision: The existing `startedAt` normalization to Africa/Abidjan date string will continue to be used to determine the "day" of the session.*
