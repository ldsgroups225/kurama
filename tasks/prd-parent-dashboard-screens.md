# PRD: Écrans du Tableau de Bord Parent

## Introduction/Overview

Cette fonctionnalité crée un ensemble complet d'écrans dédiés aux parents d'élèves dans l'application Kurama. Actuellement, les parents voient la même interface que les étudiants (avec XP, flashcards, quiz), ce qui n'est pas adapté à leur besoin principal : **superviser la progression de leur enfant**.

**Problème résolu** : Les parents n'ont aucune visibilité sur l'activité d'étude de leur enfant, ce qui limite leur capacité à encourager et accompagner la réussite scolaire.

---

## Goals

1. **Navigation différenciée** : Les parents ont leur propre barre de navigation en bas
2. **Tableau de bord parent** : Vue d'ensemble de l'activité de l'enfant
3. **Statistiques détaillées** : Performance par matière visible
4. **Alertes intelligentes** : Notifications en cas d'inactivité ou progrès
5. **Multi-enfants** : Possibilité de suivre plusieurs enfants

---

## User Stories

### US1 - Accès au dashboard parent
>
> En tant que **parent**, je veux voir automatiquement mon tableau de bord de suivi quand je me connecte, afin de ne pas avoir à naviguer dans l'interface étudiant.

### US2 - Voir le statut d'activité
>
> En tant que **parent**, je veux voir en un coup d'œil si mon enfant a étudié aujourd'hui (🟢 actif, 🟡 inactif 2-3j, 🔴 inactif 4j+), afin de savoir s'il est régulier.

### US3 - Consulter le temps d'étude hebdomadaire
>
> En tant que **parent**, je veux voir le temps total d'étude de mon enfant cette semaine, afin de m'assurer qu'il travaille suffisamment.

### US4 - Voir les performances par matière
>
> En tant que **parent**, je veux voir le taux de réussite aux flashcards par matière avec les tendances (↑↓→), afin d'identifier où mon enfant a besoin de soutien.

### US5 - Recevoir des alertes
>
> En tant que **parent**, je veux être alerté si mon enfant n'a pas étudié depuis 3+ jours, afin de pouvoir intervenir.

### US6 - Suivre plusieurs enfants
>
> En tant que **parent de plusieurs enfants**, je veux pouvoir basculer facilement entre les profils de mes enfants, afin de suivre chacun d'eux.

### US7 - Consulter les paramètres
>
> En tant que **parent**, je veux pouvoir configurer mes préférences de notifications et voir mon profil parent.

---

## Functional Requirements

### FR1 - Navigation Parent (`ParentBottomNav`)

1. La navigation parent doit remplacer la navigation étudiant
2. La navigation doit contenir 4 items : **Accueil**, **Stats**, **Alertes**, **Profil**
3. Chaque item doit avoir une icône et un label
4. L'item actif doit avoir un effet visuel (glow + couleur)
5. La navigation doit être fixée en bas de l'écran

### FR2 - Page d'accueil Parent (`/app/parent`)

1. Afficher un sélecteur d'enfant si le parent en a plusieurs
2. Afficher une carte de statut avec :
   - Avatar et nom de l'enfant
   - Badge de statut coloré (vert/orange/rouge)
   - Dernière activité (relative : "Il y a 2 heures")
3. Afficher une carte "Cette semaine" avec :
   - Temps d'étude total (ex: "12h 30min")
   - Barre de progression vers objectif hebdomadaire
4. Afficher la série actuelle (streak) de l'enfant
5. Afficher un résumé des alertes s'il y en a

### FR3 - Page Statistiques (`/app/parent/stats`)

1. Afficher un graphique d'activité sur 7 jours
2. Afficher une grille des performances par matière avec :
   - Nom de la matière
   - Taux de réussite (%)
   - Tendance (↑ amélioration, ↓ baisse, → stable)
   - Temps passé sur la matière
3. Afficher les 3 dernières sessions d'étude

### FR4 - Page Alertes (`/app/parent/alerts`)

1. Afficher la liste des alertes non lues
2. Chaque alerte doit afficher :
   - Icône de type (⚠️ attention, ✅ succès, ℹ️ info)
   - Description de l'alerte
   - Date/heure
3. Permettre de marquer une alerte comme lue
4. Afficher un état vide si aucune alerte

### FR5 - Page Profil Parent (`/app/parent/profile`)

1. Afficher les informations du parent (nom, email)
2. Afficher la liste des enfants liés
3. Permettre d'ajouter un enfant (saisie de code)
4. Bouton de déconnexion

---

## Non-Goals (Out of Scope)

- ❌ Système de liaison parent-enfant par code (Phase 2)
- ❌ Notifications push (Phase 2)
- ❌ Objectifs partagés parent-enfant (Phase 2)
- ❌ Rapports PDF mensuels (Phase 3)
- ❌ Recommandations IA (Phase 3)
- ❌ Messagerie in-app (Phase 3)

---

## Design Considerations

### Palette de couleurs parent

- **Primaire** : Teal/Cyan (différencier du violet étudiant)
- **Statut actif** : Vert émeraude
- **Statut attention** : Orange ambre
- **Statut urgent** : Rouge

### Composants existants à réutiliser

- `Avatar`, `Button`, `Card` de shadcn/ui
- `motion` de motion/react pour animations
- Structure de `BottomNav` existante

### Mobile-first

- Taille de police minimale 16px pour lisibilité
- Touches tactiles minimales 44x44px
- Design vertical avec cartes empilables

---

## Technical Considerations

### Routes à créer

```
/app/parent/          → Page d'accueil parent
/app/parent/stats     → Statistiques détaillées
/app/parent/alerts    → Centre d'alertes
/app/parent/profile   → Profil et paramètres
```

### Nouveaux composants

```
/components/parent-dashboard/
├── ParentBottomNav.tsx
├── ChildSelector.tsx
├── ActivityStatusCard.tsx
├── WeeklyStudyCard.tsx
├── StreakCard.tsx
├── SubjectPerformanceGrid.tsx
├── AlertsList.tsx
└── ParentHeader.tsx
```

### Nouveaux atoms Jotai

- `currentChildIdAtom` : ID de l'enfant sélectionné
- `parentAlertsAtom` : Alertes non lues

### Logique de routing

Dans `_auth/route.tsx`, rediriger vers `/app/parent` si `userProfile.userType === 'parent'`

---

## Success Metrics

| Métrique | Cible | Comment mesurer |
|----------|-------|-----------------|
| Adoption | 50% des parents utilisent le dashboard | Analytics page views |
| Engagement | > 2 min par session | Temps moyen sur page |
| Rétention | +20% de parents actifs/semaine | DAU/WAU ratio |
| Satisfaction | NPS > 40 | Survey in-app |

---

## Open Questions

1. **Données mockées** : Pour le MVP, faut-il utiliser des données mockées ou attendre le backend ?
   - Recommandation : Données mockées pour livrer rapidement l'UI

2. **Toast de bienvenue** : Afficher un message de bienvenue au premier accès parent ?
   - Recommandation : Oui, avec guide rapide

3. **Mode hors-ligne** : Priorité pour le cache des données parent ?
   - Recommandation : Cache du statut et du temps d'étude uniquement

---

*PRD créé le 13/01/2026 - Version 1.0*
