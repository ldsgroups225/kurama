# Documentation Hors Ligne Kurama

Ce répertoire contient la documentation complète pour utiliser Kurama hors ligne.

## Fichiers de Documentation

### 1. **help.html** - Page d'aide interactive
- Page HTML autonome disponible hors ligne
- Accessible via `/help.html` dans le navigateur
- Contient tous les guides et FAQ
- Peut être ouverte dans une nouvelle fenêtre depuis l'application
- Entièrement stylisée et responsive

### 2. **OFFLINE_GUIDE.md** - Guide complet d'utilisation
- Guide détaillé pour utiliser Kurama hors ligne
- Sections : Démarrage, Fonctionnalités, Synchronisation, Stockage
- Format Markdown pour lecture facile
- Inclus dans le dépôt pour référence

### 3. **TROUBLESHOOTING.md** - Guide de dépannage
- Solutions aux problèmes courants
- Organisé par catégorie (connexion, synchronisation, stockage, etc.)
- Étapes détaillées pour résoudre chaque problème
- Informations de contact pour le support

### 4. **FAQ.md** - Questions fréquemment posées
- Questions et réponses organisées par sujet
- Couvre installation, utilisation, synchronisation, stockage, etc.
- Format facile à parcourir
- Réponses concises et utiles

## Accès à la Documentation

### Dans l'application
- Cliquez sur l'icône d'aide (?) dans la barre de navigation
- La page d'aide s'ouvre dans une nouvelle fenêtre
- Disponible même hors ligne

### Via le navigateur
- Accédez directement à `/help.html`
- Fonctionne en ligne et hors ligne
- Responsive sur tous les appareils

### Via le dépôt
- Consultez les fichiers Markdown dans ce répertoire
- Utile pour les développeurs et les contributeurs

## Contenu de la Documentation

### Page d'aide (help.html)

**Sections principales :**
1. **Démarrage rapide** - Installation et première utilisation
2. **Fonctionnalités hors ligne** - Ce que vous pouvez faire sans connexion
3. **Synchronisation des données** - Comment vos données sont synchronisées
4. **Gestion du stockage** - Gérer l'espace de votre appareil
5. **Dépannage** - Solutions aux problèmes courants
6. **Questions fréquentes** - FAQ complète

**Caractéristiques :**
- Design moderne et responsive
- Navigation facile avec table des matières
- Codes couleur pour différents types d'informations
- Accessible hors ligne
- Optimisé pour tous les appareils

### Guide complet (OFFLINE_GUIDE.md)

Couvre :
- Installation sur différents appareils
- Utilisation hors ligne
- Synchronisation automatique
- Gestion du cache et du stockage
- Dépannage des problèmes courants
- FAQ

### Guide de dépannage (TROUBLESHOOTING.md)

Sections :
- Problèmes de connexion
- Problèmes de synchronisation
- Problèmes de stockage
- Problèmes hors ligne
- Problèmes de profil
- Problèmes de mise à jour
- Problèmes de navigateur
- Comment contacter le support

### FAQ (FAQ.md)

Catégories :
- Installation et configuration
- Utilisation et fonctionnalités
- Synchronisation et données
- Stockage et espace
- Comptes et authentification
- Profil et paramètres
- Problèmes et dépannage
- Assistance
- Confidentialité et sécurité
- Autres questions

## Mise à jour de la Documentation

### Pour ajouter du contenu

1. **Pour la page d'aide (help.html) :**
   - Modifiez le fichier HTML directement
   - Ajoutez une nouvelle section avec la classe `section`
   - Mettez à jour la table des matières

2. **Pour les guides Markdown :**
   - Modifiez les fichiers `.md` correspondants
   - Utilisez le format Markdown standard
   - Gardez la structure organisée

### Bonnes pratiques

- Gardez le contenu à jour avec les nouvelles fonctionnalités
- Utilisez un langage clair et simple
- Incluez des exemples pratiques
- Testez les liens et les références
- Vérifiez la compatibilité hors ligne

## Intégration avec l'application

### Composant HelpLink

Le composant `HelpLink` dans `src/components/pwa/help-link.tsx` :
- Affiche un bouton d'aide dans la barre de navigation
- Ouvre la page d'aide dans une nouvelle fenêtre
- Disponible en ligne et hors ligne
- Accessible via clavier

### Service Worker

La page d'aide est précachée par le service worker :
- Ajoutée à `additionalManifestEntries` dans `vite.config.ts`
- Disponible immédiatement après l'installation
- Mise à jour automatiquement avec les mises à jour de l'app

## Accessibilité

La documentation est conçue pour être accessible :
- Contraste de couleur suffisant
- Texte lisible et bien structuré
- Navigation au clavier
- Responsive sur tous les appareils
- Pas de dépendances externes

## Performance

- Page d'aide légère (< 100 KB)
- Pas de JavaScript externe
- CSS intégré pour performance
- Optimisée pour les connexions lentes
- Fonctionne hors ligne sans problème

## Support et Feedback

Si vous avez des suggestions pour améliorer la documentation :
- Contactez l'équipe de support
- Ouvrez une issue sur le dépôt
- Envoyez un e-mail à support@kurama.app

## Langues

Actuellement, la documentation est disponible en français. Les traductions futures incluront :
- Anglais
- Autres langues locales

## Historique des modifications

### Version 1.0 (Novembre 2024)
- Documentation initiale créée
- Page d'aide HTML
- Guides Markdown
- FAQ complète
- Guide de dépannage
