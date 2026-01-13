# PRD: Referral Screen Inline Color Refactoring

## Introduction/Overview

This task addresses a UI/UX bug on the referral screen where colors are currently defined using inline or hardcoded values rather than leveraging the application's established theme colors. This approach leads to inconsistency across the application's UI, makes global theme updates difficult, and can introduce visual regressions. The objective is to refactor the referral screen's styling to exclusively use the defined theme colors.

## Goals

1. **Eliminate Inline Colors:** Remove all instances of hardcoded hex codes, RGB values, or named colors that are not part of the theme system in the Referral Screen.
2. **Ensure Theme Consistency:** Bind all color properties to the application's design tokens/theme variables (e.g., Tailwind classes like `text-primary`, `bg-background`, `border-border`).
3. **Visual Parity:** Maintain the current visual design while switching the underlying implementation to the theme system.
4. **Dark/Light Mode Support:** Ensure that the refactoring correctly supports color mode switching (if applicable) by using semantic tokens.

## User Stories

- **As a developer**, I want global theme changes to automatically reflect on the referral screen so that the app remains visually consistent.
- **As a user**, I want the referral screen to look and feel like the rest of the application, with consistent colors and styling.

## Functional Requirements

1. **Identify Components:** Locate `ReferralPage` (or equivalent) and its sub-components.
2. **Refactor Styling:**
    - Replace arbitrary hex values (e.g., `#A020F0`) with semantic classes (e.g., `text-purple-600` or `text-primary` if mapped).
    - Replace inline `style={{ color: '...' }}` with Tailwind classes or CSS variables.
3. **Validation:** Ensure text contrast and visual hierarchy remain intact.

## Technical Considerations

- **Tech Stack:** React, Tailwind CSS (assumed based on previous file views).
- **Theme Source:** `tailwind.config.ts` or `globals.css` (CSS variables).
- **Scope:** Specifically the Referral/Parrainage screen/route.

## Acceptance Criteria

- [ ] No hardcoded color values (hex, rgb, etc.) remain in the referral screen files.
- [ ] All colors use Tailwind utility classes or app-specific CSS variables.
- [ ] The screen looks visually identical to the "before" state (or better, if the hardcoded values were slightly off).
- [ ] No regressions in functionality.

## Open Questions

- *Are there specific custom colors used in the referral screen that need to be added to the theme config first?* (Will check during implementation).
