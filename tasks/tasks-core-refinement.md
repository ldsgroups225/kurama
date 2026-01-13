# PRD - Finalisation des fonctionnalités de base et Nettoyage (Refinement & Core Logic)

## Relevant Files

- `packages/data-ops/src/drizzle/schema.ts` - Modification du schéma pour ajouter les colonnes de notification et rôles.
- `apps/user-application/src/core/functions/parent.ts` - Ajout des fonctions de marquage des alertes comme lues.
- `apps/user-application/src/hooks/use-parent-dashboard.ts` - Mise à jour pour appeler les nouvelles fonctions de persistance.
- `apps/user-application/src/routes/_auth/app/progress.tsx` - Intégration de l'appel API pour les succès.
- `apps/user-application/src/routes/_public/terms.tsx` - Nouvelle page des conditions d'utilisation.
- `apps/user-application/src/routes/_public/privacy.tsx` - Nouvelle page de confidentialité.
- `apps/kurama-admin/src/core/middleware/admin-auth.ts` - Sécurisation de l'accès admin.

### Notes

- Veiller à bien exécuter les migrations de base de données après modification du schéma.
- Utiliser `pnpm typecheck` pour valider les changements de types.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch `feat/core-refinement`
- [x] 1.0 Database Schema & Migrations
  - [x] 1.1 Update `userTypeSchema` and DB enum to include `admin` in `packages/data-ops/src/drizzle/schema.ts`
  - [x] 1.2 Add `notifiedAt` (timestamp) to achievement tracking (verify existing table name)
  - [x] 1.3 Create a table or mechanism to track "read" state for parent alerts
  - [x] 1.4 Generate and apply migrations
- [x] 2.0 Parent Alerts Persistence Logic
  - [x] 2.1 Implement `markAlertAsRead` and `markAllAlertsAsRead` server functions in `parent.ts`
  - [x] 2.2 Update `useParentAlerts` hook to use actual server functions instead of `console.warn`
  - [x] 2.3 Refactor `getParentAlerts` to exclude or mark read alerts based on DB state
- [x] 3.0 Achievement Notification Tracking
  - [x] 3.1 Implement `markAchievementsNotified` server function
  - [x] 3.2 Update `AchievementUnlockToast` or its parent to call this function after display
  - [x] 3.3 Ensure the progress page only triggers celebrations for unnotified achievements
- [x] 4.0 Public Legal Pages & Navigation Links
  - [x] 4.1 Create `/_public/terms` route and component with placeholder content
  - [x] 4.2 Create `/_public/privacy` route and component with placeholder content
  - [x] 4.3 Update `AuthScreen` and `UserTypeSelection` links to point to these new routes
- [x] 5.0 Admin Access Security Implementation
  - [x] 5.1 Update admin middleware to verify `userType === 'admin'`
  - [x] 5.2 Add a security check in `kurama-admin` to prevent non-admin access
  - [x] 5.3 Final cleanup of all identified "TODO" comments in the codebase
