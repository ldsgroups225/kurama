# PRD - Finalisation des fonctionnalités de base et Nettoyage (Refinement & Core Logic)

## 1. Introduction/Overview

Ce document définit les exigences pour finaliser les fonctionnalités essentielles restées en suspens (marquées en TODO) dans l'application Kurama. Ces tâches concernent principalement la persistance des états utilisateur (alertes, succès), la navigation vers les pages légales et la sécurisation de l'accès administrateur.

## 2. Objectifs

* Assurer la persistance réelle des interactions utilisateur (lecture d'alertes, notifications de succès).
* Compléter le parcours utilisateur avec les mentions légales et la politique de confidentialité.
* Sécuriser l'accès à l'interface d'administration.
* Passer d'une logique "mockée" ou "placeholder" à une logique de production.

## 3. User Stories

* **En tant que parent**, je veux que les alertes que j'ai lues ne s'affichent plus comme nouvelles la prochaine fois que je me connecte.
* **En tant qu'élève**, je veux ne plus voir la même animation de "Succès débloqué" à chaque chargement de mon profil si je l'ai déjà vue.
* **En tant qu'utilisateur**, je veux pouvoir consulter les conditions d'utilisation et la politique de confidentialité pour comprendre comment mes données sont gérées.
* **En tant que membre de l'équipe**, je veux m'assurer que seules les personnes autorisées peuvent accéder aux outils d'administration.

## 4. Exigences Fonctionnelles

### 4.1 Persistance des Alertes Parent

1. Le système doit permettre de marquer une alerte spécifique comme "lue" en base de données.
2. Le système doit permettre de marquer toutes les alertes d'un parent comme "lues" en une seule action.
3. L'état "lu" doit être conservé entre les sessions.

### 4.2 Persistance des Notifications de Succès (Achievements)

1. Le système doit enregistrer la date à laquelle un utilisateur a été notifié d'un succès débloqué.
2. L'API `markAchievementsNotified` doit être créée pour mettre à jour cet état.
3. L'interface ne doit afficher le toast de célébration que pour les succès n'ayant pas encore de date de notification.

### 4.3 Pages Légales et Navigation

1. Création des routes `/_public/terms` et `/_public/privacy`.
2. Implémentation de composants de texte structuré pour ces deux pages.
3. Connexion des liens "Conditions" et "Confidentialité" dans les écrans d'authentification et de sélection de type d'utilisateur.

### 4.4 Sécurité Admin

1. Modification du schéma `userType` pour inclure explicitement le rôle `admin`.
2. Implémentation d'un garde (middleware) dans `kurama-admin` vérifiant que le profil utilisateur possède le type `admin`.

## 5. Non-Goals (Out of Scope)

* Refonte graphique complète des pages légales.
* Système de notifications push (uniquement stockage de l'état "lu" en base pour l'instant).
* Gestion avancée des permissions multi-niveaux pour les admins.

## 6. Design Considerations

* Les pages de mentions légales doivent suivre le thème sobre et lisible de Kurama (utilisation de la typographie et des espacements standards).
* L'état "lu" des alertes doit être visuellement distinct (opacité réduite, disparition de la pastille de couleur).

## 7. Technical Considerations

* **Base de données** : Utiliser Drizzle ORM pour ajouter les colonnes/tables nécessaires.
  * Table `user_achievements` : ajouter `notified_at`.
  * Table `parent_alerts_metadata` (ou similaire) pour suivre les alertes générées dynamiquement.
* **Auth** : Mise à jour du client auth pour supporter le nouveau type utilisateur.

## 8. Success Metrics

* Zéro TODO restant dans les fichiers identifiés.
* Validation du typecheck et du linter sur l'ensemble du projet.
* L'interface admin renvoie une erreur 403 pour un compte élève/parent.

## 9. Open Questions

* Faut-il stocker les alertes générées par le serveur de façon permanente ou les recalculer à chaque fois et stocker l'exclusion ? (Choix technique : Stockage des exclusions/dates de lecture).
