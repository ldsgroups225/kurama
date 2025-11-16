# Guide de Dépannage Kurama

Ce guide vous aide à résoudre les problèmes courants avec Kurama.

## Problèmes de connexion

### Je ne peux pas me connecter

**Symptômes :**
- Erreur "Authentification échouée"
- Page de connexion qui ne charge pas
- Redirection infinie vers la page de connexion

**Solutions :**

1. **Vérifiez votre connexion Internet**
   - Assurez-vous que vous êtes connecté à Internet
   - Essayez de charger une autre page web pour confirmer

2. **Videz le cache du navigateur**
   - Chrome/Edge : Ctrl+Shift+Delete (Cmd+Shift+Delete sur Mac)
   - Firefox : Ctrl+Shift+Delete
   - Safari : Préférences → Confidentialité → Gérer les données du site
   - Sélectionnez "Tous les sites" et cliquez "Supprimer"

3. **Vérifiez votre compte Google**
   - Assurez-vous que votre compte Google est actif
   - Essayez de vous connecter à Google directement
   - Vérifiez que vous n'avez pas d'authentification à deux facteurs bloquée

4. **Réinstallez l'application**
   - Désinstallez Kurama
   - Redémarrez votre appareil
   - Réinstallez Kurama depuis le navigateur

5. **Contactez le support**
   - Si le problème persiste, contactez notre équipe de support

### Je suis connecté mais je vois une page blanche

**Symptômes :**
- L'application charge mais affiche une page vide
- Pas d'erreur visible

**Solutions :**

1. **Attendez le chargement**
   - L'application peut prendre quelques secondes à charger
   - Attendez au moins 10 secondes

2. **Rafraîchissez la page**
   - Appuyez sur F5 ou Cmd+R
   - Ou cliquez sur le bouton Rafraîchir du navigateur

3. **Videz le cache**
   - Suivez les étapes ci-dessus pour vider le cache du navigateur
   - Puis réouvrez Kurama

4. **Vérifiez la console pour les erreurs**
   - Appuyez sur F12 pour ouvrir les outils de développement
   - Allez à l'onglet "Console"
   - Cherchez les messages d'erreur en rouge
   - Notez les erreurs et contactez le support

## Problèmes de synchronisation

### Mes données ne se synchronisent pas

**Symptômes :**
- L'indicateur de synchronisation reste bloqué
- Les mutations ne sont pas traitées
- Les données ne sont pas mises à jour sur d'autres appareils

**Solutions :**

1. **Vérifiez votre connexion Internet**
   - Assurez-vous que vous êtes en ligne
   - Essayez de charger une page web

2. **Attendez la synchronisation automatique**
   - La synchronisation peut prendre quelques secondes
   - Attendez au moins 30 secondes

3. **Ouvrez le tableau de bord de synchronisation**
   - Cliquez sur l'indicateur de synchronisation dans la barre de navigation
   - Vérifiez le statut des mutations
   - Cherchez les erreurs

4. **Réessayez manuellement**
   - Cliquez sur "Réessayer" pour les mutations échouées
   - Attendez que la synchronisation se termine

5. **Redémarrez l'application**
   - Fermez complètement Kurama
   - Attendez 10 secondes
   - Rouvrez Kurama

6. **Vérifiez votre quota de stockage**
   - Allez dans Paramètres → Gestion du cache
   - Vérifiez que vous avez de l'espace disponible
   - Supprimez les anciennes données si nécessaire

### Je vois un message "Conflit de données"

**Symptômes :**
- Message "Conflit détecté"
- Les données ne se synchronisent pas
- Vous avez modifié les mêmes données sur plusieurs appareils

**Solutions :**

1. **Comprendre le conflit**
   - Cela signifie que vous avez modifié les mêmes données sur plusieurs appareils
   - Kurama utilise la stratégie "dernière écriture gagne"
   - Vos modifications les plus récentes seront conservées

2. **Vérifiez le tableau de bord de synchronisation**
   - Ouvrez le tableau de bord pour voir les détails du conflit
   - Vérifiez quelle version a été conservée

3. **Résolvez manuellement si nécessaire**
   - Si vous avez besoin de la version précédente, contactez le support
   - Nous pouvons vous aider à récupérer les données

## Problèmes de stockage

### Je reçois une erreur "Stockage plein"

**Symptômes :**
- Message "Quota de stockage dépassé"
- Impossible de télécharger du contenu
- L'application ralentit

**Solutions :**

1. **Vérifiez l'espace disponible**
   - Allez dans Paramètres → Gestion du cache
   - Vérifiez l'espace utilisé et disponible

2. **Supprimez les anciennes données**
   - Cliquez sur "Effacer les anciennes données"
   - Cela supprimera les données non utilisées depuis 7 jours

3. **Supprimez le contenu en cache**
   - Allez dans Paramètres → Gestion du cache
   - Sélectionnez les leçons à supprimer
   - Cliquez sur "Supprimer"

4. **Effacez tout le cache**
   - Cliquez sur "Effacer tout le cache"
   - Confirmez l'action
   - Vos données de progression seront conservées

5. **Libérez de l'espace sur votre appareil**
   - Supprimez d'autres applications ou fichiers
   - Vérifiez que votre appareil a au moins 100 MB d'espace libre

### L'application est lente

**Symptômes :**
- L'application met longtemps à charger
- Les interactions sont lentes
- Les animations sont saccadées

**Solutions :**

1. **Vérifiez votre connexion Internet**
   - Une connexion lente peut ralentir l'application
   - Essayez de vous connecter à un meilleur réseau

2. **Videz le cache**
   - Allez dans Paramètres → Gestion du cache
   - Cliquez sur "Effacer les anciennes données"

3. **Redémarrez l'application**
   - Fermez complètement Kurama
   - Attendez 10 secondes
   - Rouvrez Kurama

4. **Vérifiez la mémoire disponible**
   - Fermez d'autres applications
   - Redémarrez votre appareil si nécessaire

5. **Désinstallez et réinstallez**
   - Désinstallez Kurama
   - Redémarrez votre appareil
   - Réinstallez Kurama

## Problèmes hors ligne

### L'application ne fonctionne pas hors ligne

**Symptômes :**
- L'application affiche une page d'erreur hors ligne
- Impossible d'accéder aux leçons
- Impossible d'étudier sans connexion

**Solutions :**

1. **Téléchargez le contenu d'abord**
   - Vous devez d'abord utiliser l'application en ligne
   - Ouvrez les leçons que vous souhaitez étudier hors ligne
   - Cliquez sur "Télécharger pour l'étude hors ligne"
   - Attendez que le téléchargement soit terminé

2. **Vérifiez que le contenu est en cache**
   - Allez dans Paramètres → Gestion du cache
   - Vérifiez que les leçons sont listées

3. **Vérifiez votre connexion**
   - Assurez-vous que vous êtes vraiment hors ligne
   - Vérifiez que le Wi-Fi et les données mobiles sont désactivés

4. **Redémarrez l'application**
   - Fermez complètement Kurama
   - Attendez 10 secondes
   - Rouvrez Kurama

### Mes réponses ne sont pas enregistrées hors ligne

**Symptômes :**
- Les réponses disparaissent après fermeture de l'application
- L'XP n'est pas enregistré
- La progression n'est pas mise à jour

**Solutions :**

1. **Vérifiez que vous êtes connecté**
   - Vérifiez que vous êtes connecté à votre compte
   - Allez dans Paramètres → Profil pour vérifier

2. **Vérifiez l'espace de stockage**
   - Allez dans Paramètres → Gestion du cache
   - Assurez-vous que vous avez de l'espace disponible

3. **Attendez la synchronisation**
   - Vos réponses sont enregistrées localement
   - Elles seront synchronisées quand vous serez en ligne
   - Attendez quelques secondes après vous être reconnecté

4. **Vérifiez le tableau de bord de synchronisation**
   - Ouvrez le tableau de bord pour voir le statut
   - Vérifiez s'il y a des erreurs

## Problèmes de profil

### Je ne peux pas compléter mon profil

**Symptômes :**
- Le formulaire de profil ne se soumet pas
- Erreur lors de la sauvegarde du profil
- Redirection infinie vers l'onboarding

**Solutions :**

1. **Vérifiez votre connexion Internet**
   - Assurez-vous que vous êtes en ligne
   - Essayez de charger une autre page

2. **Remplissez tous les champs obligatoires**
   - Vérifiez que tous les champs sont remplis
   - Cherchez les messages d'erreur en rouge

3. **Vérifiez les données saisies**
   - Assurez-vous que les données sont valides
   - Par exemple, sélectionnez un niveau scolaire valide

4. **Videz le cache et réessayez**
   - Videz le cache du navigateur
   - Rechargez la page
   - Remplissez le formulaire à nouveau

5. **Contactez le support**
   - Si le problème persiste, contactez notre équipe de support

## Problèmes de mise à jour

### Je reçois une notification de mise à jour

**Symptômes :**
- Message "Nouvelle version disponible"
- Bouton "Mettre à jour maintenant"

**Solutions :**

1. **Mettez à jour l'application**
   - Cliquez sur "Mettre à jour maintenant"
   - Attendez que la mise à jour soit terminée
   - L'application se rechargera automatiquement

2. **Mettez à jour plus tard**
   - Cliquez sur "Plus tard"
   - Vous serez averti à nouveau plus tard

3. **Mettez à jour manuellement**
   - Rafraîchissez la page (F5 ou Cmd+R)
   - Cela forcera le téléchargement de la dernière version

## Problèmes de navigateur

### Kurama ne fonctionne pas sur mon navigateur

**Symptômes :**
- L'application ne charge pas
- Les fonctionnalités ne fonctionnent pas
- Des erreurs JavaScript

**Solutions :**

1. **Vérifiez la compatibilité du navigateur**
   - Kurama fonctionne mieux sur les navigateurs modernes
   - Mettez à jour votre navigateur à la dernière version
   - Navigateurs supportés : Chrome, Firefox, Safari, Edge

2. **Essayez un autre navigateur**
   - Essayez Chrome, Firefox, Safari ou Edge
   - Vérifiez si le problème persiste

3. **Vérifiez les extensions du navigateur**
   - Les extensions peuvent interférer avec Kurama
   - Essayez de désactiver les extensions
   - Puis réouvrez Kurama

4. **Videz le cache du navigateur**
   - Suivez les étapes ci-dessus pour vider le cache
   - Puis réouvrez Kurama

## Contacter le support

Si vous ne trouvez pas la solution à votre problème :

1. **Notez les détails du problème**
   - Décrivez ce qui s'est passé
   - Notez le message d'erreur exact
   - Indiquez quand le problème s'est produit

2. **Ouvrez les outils de développement**
   - Appuyez sur F12
   - Allez à l'onglet "Console"
   - Copiez les messages d'erreur

3. **Contactez le support**
   - Allez dans Paramètres → Support
   - Ou envoyez un e-mail à support@kurama.app
   - Incluez les détails du problème et les messages d'erreur

4. **Fournissez des informations utiles**
   - Votre navigateur et sa version
   - Votre système d'exploitation
   - Votre appareil (desktop, mobile, tablette)
   - Les étapes pour reproduire le problème
