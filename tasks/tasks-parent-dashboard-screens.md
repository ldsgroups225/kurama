# Tasks: Parent Dashboard Screens

## Relevant Files

- `apps/user-application/src/components/parent-dashboard/ParentBottomNav.tsx` - Navigation en bas d'écran spécifique aux parents
- `apps/user-application/src/components/parent-dashboard/ChildSelector.tsx` - Sélecteur d'enfant dropdown
- `apps/user-application/src/components/parent-dashboard/ActivityStatusCard.tsx` - Carte de statut d'activité
- `apps/user-application/src/components/parent-dashboard/WeeklyStudyCard.tsx` - Carte temps d'étude hebdomadaire
- `apps/user-application/src/components/parent-dashboard/StreakCard.tsx` - Carte de série
- `apps/user-application/src/components/parent-dashboard/SubjectPerformanceGrid.tsx` - Grille performances par matière
- `apps/user-application/src/components/parent-dashboard/AlertsList.tsx` - Liste des alertes
- `apps/user-application/src/components/parent-dashboard/ParentHeader.tsx` - En-tête pour les pages parent
- `apps/user-application/src/components/parent-dashboard/index.ts` - Barrel export
- `apps/user-application/src/routes/_auth/app/parent/index.tsx` - Page d'accueil parent
- `apps/user-application/src/routes/_auth/app/parent/stats.tsx` - Page statistiques
- `apps/user-application/src/routes/_auth/app/parent/alerts.tsx` - Page alertes
- `apps/user-application/src/routes/_auth/app/parent/profile.tsx` - Page profil parent
- `apps/user-application/src/hooks/use-parent-dashboard.ts` - Hook pour données parent
- `apps/user-application/src/lib/atoms/parent-dashboard.ts` - Atoms Jotai pour état parent

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx vitest [optional/path/to/test/file]` to run tests.
- Suivre le style existant du `BottomNav` et des écrans étudiant pour la cohérence visuelle.
- Utiliser les couleurs teal/cyan pour différencier visuellement du violet étudiant.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch `feature/parent-dashboard-screens`

- [x] 1.0 Create Parent Bottom Navigation Component
  - [x] 1.1 Create the `components/parent-dashboard/` directory structure
  - [x] 1.2 Create `ParentBottomNav.tsx` with 4 nav items: Accueil, Stats, Alertes, Profil
  - [x] 1.3 Use teal/cyan color scheme to differentiate from student navigation
  - [x] 1.4 Add motion animations matching existing BottomNav style
  - [x] 1.5 Create barrel export `index.ts` for the parent-dashboard components

- [x] 2.0 Create Parent Dashboard Home Page (`/app/parent`)
  - [x] 2.1 Create route file `routes/_auth/app/parent/index.tsx`
  - [x] 2.2 Create `ParentHeader.tsx` component with greeting and child selector
  - [x] 2.3 Create `ChildSelector.tsx` dropdown component for multiple children
  - [x] 2.4 Create `ActivityStatusCard.tsx` with avatar, name, status badge (🟢🟡🔴)
  - [x] 2.5 Create `WeeklyStudyCard.tsx` with time display and progress bar
  - [x] 2.6 Create `StreakCard.tsx` showing child's current streak
  - [x] 2.7 Assemble all components in the parent index page
  - [x] 2.8 Add ambient background effects matching app design

- [x] 3.0 Create Parent Statistics Page (`/app/parent/stats`)
  - [x] 3.1 Create route file `routes/_auth/app/parent/stats.tsx`
  - [x] 3.2 Create weekly activity bar chart (7 days)
  - [x] 3.3 Create `SubjectPerformanceGrid.tsx` with subject cards showing % and trend
  - [x] 3.4 Add recent sessions list at the bottom
  - [x] 3.5 Add loading skeletons for data fetching states

- [x] 4.0 Create Parent Alerts Page (`/app/parent/alerts`)
  - [x] 4.1 Create route file `routes/_auth/app/parent/alerts.tsx`
  - [x] 4.2 Create `AlertsList.tsx` component
  - [x] 4.3 Create individual `AlertCard.tsx` with icon, description, timestamp
  - [x] 4.4 Add empty state when no alerts
  - [x] 4.5 Add "mark as read" functionality (local state for MVP)

- [x] 5.0 Create Parent Profile Page (`/app/parent/profile`)
  - [x] 5.1 Create route file `routes/_auth/app/parent/profile.tsx`
  - [x] 5.2 Display parent info (name, email, avatar)
  - [x] 5.3 Show list of linked children with status
  - [x] 5.4 Add placeholder for "Add child" button (non-functional for MVP)
  - [x] 5.5 Add sign out button with confirmation

- [x] 6.0 Implement Routing Logic for Parent Users
  - [x] 6.1 Create Jotai atom `currentChildIdAtom` in `lib/atoms/parent-dashboard.ts`
  - [x] 6.2 Modify `_auth/route.tsx` to check `userProfile.userType`
  - [x] 6.3 Redirect parents to `/app/parent` instead of `/app`
  - [x] 6.4 Ensure BottomNav switches based on user type (N/A - parent pages have their own nav)

- [x] 7.0 Create Mock Data and Hooks for Parent Dashboard
  - [x] 7.1 Create `hooks/use-parent-dashboard.ts` with mock data
  - [x] 7.2 Define TypeScript types for ChildProfile, ChildStats, Alert
  - [x] 7.3 Create mock data for 2 children with realistic stats
  - [x] 7.4 Create mock alerts (inactivity, success, info)
  - [x] 7.5 Wire up hooks to all parent dashboard components

- [x] 8.0 Testing and Polish
  - [x] 8.1 Test all screens on mobile viewport (375px width)
  - [x] 8.2 Verify all animations are smooth (no jank)
  - [x] 8.3 Test navigation between all parent pages
  - [x] 8.4 Verify child selector updates all cards
  - [x] 8.5 Check accessibility (focus states, screen reader)
  - [x] 8.6 Final visual review and polish
