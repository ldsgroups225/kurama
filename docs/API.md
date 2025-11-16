# Documentation API de Kurama

Cette documentation décrit l'API REST de Kurama, construite avec Hono et déployée sur Cloudflare Workers. L'API fournit des endpoints pour l'authentification, la gestion des utilisateurs, le contenu éducatif et le suivi de la progression.

## Base URL

```
Production: https://back-kurama.yeko.workers.dev
Développement: http://localhost:8787
```

## Authentification

L'API utilise Better Auth pour l'authentification. Deux méthodes sont disponibles :

1. **Email OTP**: Code à usage unique envoyé par email
2. **Google OAuth**: Connexion via compte Google

### Headers Requis

Pour les endpoints protégés, incluez :

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints d'Authentification

### Envoyer OTP par Email

```http
POST /api/auth/sign-in/email
```

**Corps de la requête** :

```json
{
  "email": "utilisateur@exemple.com"
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "OTP envoyé à votre adresse email"
}
```

### Vérifier OTP

```http
POST /api/auth/verify-email
```

**Corps de la requête** :

```json
{
  "email": "utilisateur@exemple.com",
  "otp": "123456"
}
```

**Réponse** :

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "utilisateur@exemple.com"
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Connexion Google OAuth

```http
GET /api/auth/sign-in/google
```

Redirige vers Google pour l'authentification.

### Callback Google OAuth

```http
GET /api/auth/callback/google
```

**Paramètres de requête** :

- `code`: Code d'autorisation Google
- `state`: État de sécurité

**Réponse** :

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "utilisateur@gmail.com",
    "name": "Nom Utilisateur"
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Déconnexion

```http
POST /api/auth/sign-out
```

**Headers** :

```
Authorization: Bearer <token>
```

**Réponse** :

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

## Endpoints de Profil Utilisateur

### Obtenir le Profil Utilisateur

```http
GET /api/user/profile
```

**Headers** :

```
Authorization: Bearer <token>
```

**Réponse** :

```json
{
  "id": "user_123",
  "userType": "student",
  "firstName": "Jean",
  "lastName": "Dupont",
  "age": 16,
  "gender": "male",
  "city": "Abidjan",
  "grade": {
    "id": 5,
    "name": "Seconde",
    "slug": "seconde"
  },
  "series": {
    "id": 2,
    "name": "C",
    "description": "Série scientifique"
  },
  "favoriteSubjects": ["Mathématiques", "Physique"],
  "learningGoals": "Préparer le BAC avec succès",
  "studyTime": "2 heures par jour",
  "isCompleted": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Mettre à Jour le Profil Utilisateur

```http
PUT /api/user/profile
```

**Headers** :

```
Authorization: Bearer <token>
```

**Corps de la requête** :

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "age": 16,
  "gender": "male",
  "city": "Abidjan",
  "gradeId": 5,
  "seriesId": 2,
  "favoriteSubjects": ["Mathématiques", "Physique"],
  "learningGoals": "Préparer le BAC avec succès",
  "studyTime": "2 heures par jour"
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "profile": {
    // Profil mis à jour
  }
}
```

## Endpoints Éducatifs

### Obtenir les Niveaux

```http
GET /api/grades
```

**Réponse** :

```json
{
  "grades": [
    {
      "id": 1,
      "name": "CP1",
      "slug": "cp1",
      "category": "PRIMARY",
      "isActive": true,
      "displayOrder": 1
    },
    {
      "id": 2,
      "name": "CP2",
      "slug": "cp2",
      "category": "PRIMARY",
      "isActive": true,
      "displayOrder": 2
    }
  ]
}
```

### Obtenir les Séries

```http
GET /api/series
```

**Réponse** :

```json
{
  "series": [
    {
      "id": 1,
      "name": "A",
      "description": "Série littéraire",
      "displayOrder": 1
    },
    {
      "id": 2,
      "name": "C",
      "description": "Série scientifique",
      "displayOrder": 2
    }
  ]
}
```

### Obtenir les Matières

```http
GET /api/subjects
```

**Paramètres de requête** :

- `gradeId` (optionnel): ID du niveau pour filtrer
- `seriesId` (optionnel): ID de la série pour filtrer

**Réponse** :

```json
{
  "subjects": [
    {
      "id": 1,
      "name": "Mathématiques",
      "abbreviation": "MATH",
      "description": "Mathématiques",
      "displayOrder": 1
    },
    {
      "id": 2,
      "name": "Français",
      "abbreviation": "FR",
      "description": "Langue française",
      "displayOrder": 2
    }
  ]
}
```

### Obtenir les Leçons

```http
GET /api/lessons
```

**Paramètres de requête** :

- `subjectId` (optionnel): ID de la matière
- `gradeId` (optionnel): ID du niveau
- `seriesId` (optionnel): ID de la série
- `page` (optionnel): Numéro de page (défaut: 1)
- `limit` (optionnel): Nombre par page (défaut: 20)

**Réponse** :

```json
{
  "lessons": [
    {
      "id": 1,
      "subjectId": 1,
      "title": "Les nombres entiers",
      "description": "Introduction aux nombres entiers",
      "difficulty": "easy",
      "estimatedDuration": 30,
      "isPublished": true,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "subject": {
        "id": 1,
        "name": "Mathématiques",
        "abbreviation": "MATH"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Obtenir une Leçon

```http
GET /api/lessons/:lessonId
```

**Réponse** :

```json
{
  "id": 1,
  "subjectId": 1,
  "title": "Les nombres entiers",
  "description": "Introduction aux nombres entiers",
  "difficulty": "easy",
  "estimatedDuration": 30,
  "isPublished": true,
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "subject": {
    "id": 1,
    "name": "Mathématiques",
    "abbreviation": "MATH"
  },
  "cards": [
    {
      "id": 1,
      "lessonId": 1,
      "frontContent": "Qu'est-ce qu'un nombre entier ?",
      "backContent": "Un nombre entier est un nombre sans partie décimale...",
      "cardType": "basic",
      "displayOrder": 1,
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Endpoints de Progression

### Obtenir la Progression de l'Utilisateur

```http
GET /api/user/progress
```

**Headers** :

```
Authorization: Bearer <token>
```

**Paramètres de requête** :

- `lessonId` (optionnel): ID de la leçon
- `subjectId` (optionnel): ID de la matière

**Réponse** :

```json
{
  "progress": [
    {
      "id": 1,
      "userId": "user_123",
      "cardId": 1,
      "lessonId": 1,
      "easeFactor": 2500,
      "interval": 1,
      "repetitions": 1,
      "lastReviewedAt": "2024-01-01T00:00:00.000Z",
      "nextReviewAt": "2024-01-02T00:00:00.000Z",
      "totalReviews": 1,
      "correctReviews": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "card": {
        "id": 1,
        "frontContent": "Qu'est-ce qu'un nombre entier ?",
        "backContent": "Un nombre entier est un nombre sans partie décimale...",
        "cardType": "basic"
      },
      "lesson": {
        "id": 1,
        "title": "Les nombres entiers"
      }
    }
  ]
}
```

### Mettre à Jour la Progression

```http
POST /api/user/progress
```

**Headers** :

```
Authorization: Bearer <token>
```

**Corps de la requête** :

```json
{
  "cardId": 1,
  "lessonId": 1,
  "quality": 4,
  "responseTime": 5000
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Progression mise à jour",
  "progress": {
    "id": 1,
    "userId": "user_123",
    "cardId": 1,
    "lessonId": 1,
    "easeFactor": 2400,
    "interval": 6,
    "repetitions": 2,
    "lastReviewedAt": "2024-01-01T00:00:00.000Z",
    "nextReviewAt": "2024-01-07T00:00:00.000Z",
    "totalReviews": 2,
    "correctReviews": 2
  }
}
```

### Obtenir les Cartes à Réviser

```http
GET /api/user/due-cards
```

**Headers** :

```
Authorization: Bearer <token>
```

**Paramètres de requête** :

- `limit` (optionnel): Nombre maximum de cartes (défaut: 20)
- `lessonId` (optionnel): ID de la leçon
- `subjectId` (optionnel): ID de la matière

**Réponse** :

```json
{
  "cards": [
    {
      "id": 1,
      "lessonId": 1,
      "frontContent": "Qu'est-ce qu'un nombre entier ?",
      "backContent": "Un nombre entier est un nombre sans partie décimale...",
      "cardType": "basic",
      "displayOrder": 1,
      "progress": {
        "easeFactor": 2500,
        "interval": 1,
        "repetitions": 1,
        "nextReviewAt": "2024-01-01T00:00:00.000Z"
      },
      "lesson": {
        "id": 1,
        "title": "Les nombres entiers",
        "subject": {
          "id": 1,
          "name": "Mathématiques"
        }
      }
    }
  ]
}
```

### Créer une Session d'Étude

```http
POST /api/user/study-sessions
```

**Headers** :

```
Authorization: Bearer <token>
```

**Corps de la requête** :

```json
{
  "lessonId": 1,
  "startedAt": "2024-01-01T10:00:00.000Z"
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Session d'étude créée",
  "session": {
    "id": 1,
    "userId": "user_123",
    "lessonId": 1,
    "startedAt": "2024-01-01T10:00:00.000Z",
    "cardsReviewed": 0,
    "cardsCorrect": 0,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Terminer une Session d'Étude

```http
PUT /api/user/study-sessions/:sessionId
```

**Headers** :

```
Authorization: Bearer <token>
```

**Corps de la requête** :

```json
{
  "endedAt": "2024-01-01T10:30:00.000Z",
  "cardsReviewed": 20,
  "cardsCorrect": 18
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Session d'étude terminée",
  "session": {
    "id": 1,
    "userId": "user_123",
    "lessonId": 1,
    "startedAt": "2024-01-01T10:00:00.000Z",
    "endedAt": "2024-01-01T10:30:00.000Z",
    "cardsReviewed": 20,
    "cardsCorrect": 18,
    "duration": 1800,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

## Endpoints de Gamification

### Obtenir les Statistiques de l'Utilisateur

```http
GET /api/user/stats
```

**Headers** :

```
Authorization: Bearer <token>
```

**Réponse** :

```json
{
  "stats": {
    "totalXP": 1500,
    "level": 5,
    "currentLevelXP": 300,
    "nextLevelXP": 500,
    "streak": 7,
    "longestStreak": 15,
    "totalStudyTime": 7200,
    "cardsReviewed": 250,
    "accuracy": 0.85,
    "achievements": [
      {
        "id": 1,
        "name": "Premiers Pas",
        "description": "Compléter votre première leçon",
        "icon": "🎯",
        "unlockedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Obtenir le Classement

```http
GET /api/leaderboard
```

**Paramètres de requête** :

- `type` (optionnel): Type de classement (`weekly`, `monthly`, `all-time`, défaut: `weekly`)
- `limit` (optionnel): Nombre de résultats (défaut: 10)

**Réponse** :

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "user_456",
        "firstName": "Marie",
        "lastName": "Kouadio"
      },
      "xp": 2500,
      "level": 8,
      "streak": 12
    },
    {
      "rank": 2,
      "user": {
        "id": "user_123",
        "firstName": "Jean",
        "lastName": "Dupont"
      },
      "xp": 1500,
      "level": 5,
      "streak": 7
    }
  ],
  "userRank": {
    "rank": 25,
    "xp": 1500,
    "level": 5
  }
}
```

## Endpoints de Paiement (Polar)

### Obtenir les Abonnements Disponibles

```http
GET /api/subscriptions
```

**Réponse** :

```json
{
  "subscriptions": [
    {
      "id": "premium_monthly",
      "name": "Premium Mensuel",
      "description": "Accès premium pendant 30 jours",
      "price": {
        "amount": 5000,
        "currency": "XOF"
      },
      "features": [
        "Accès à toutes les leçons",
        "Révisions illimitées",
        "Support prioritaire"
      ],
      "interval": "month"
    },
    {
      "id": "premium_yearly",
      "name": "Premium Annuel",
      "description": "Accès premium pendant 365 jours",
      "price": {
        "amount": 50000,
        "currency": "XOF"
      },
      "features": [
        "Accès à toutes les leçons",
        "Révisions illimitées",
        "Support prioritaire",
        "2 mois gratuits"
      ],
      "interval": "year"
    }
  ]
}
```

### Créer une Session de Paiement

```http
POST /api/payments/create-checkout
```

**Headers** :

```
Authorization: Bearer <token>
```

**Corps de la requête** :

```json
{
  "subscriptionId": "premium_monthly",
  "successUrl": "https://kurama.yeko.workers.dev/polar/checkout.success",
  "cancelUrl": "https://kurama.yeko.workers.dev/polar/subscriptions"
}
```

**Réponse** :

```json
{
  "success": true,
  "checkoutUrl": "https://api.polar.sh/checkouts/checkout_123",
  "sessionId": "checkout_123"
}
```

### Gérer l'Abonnement

```http
GET /api/subscriptions/manage
```

**Headers** :

```
Authorization: Bearer <token>
```

**Réponse** :

```json
{
  "success": true,
  "customerPortalUrl": "https://api.polar.sh/customers/portal_123"
}
```

## Gestion des Erreurs

L'API utilise les codes HTTP standard pour indiquer le succès ou l'échec des requêtes :

### Codes de Succès

- `200 OK`: Requête réussie
- `201 Created`: Ressource créée avec succès
- `204 No Content`: Requête réussie sans contenu de retour

### Codes d'Erreur Client

- `400 Bad Request`: Requête invalide
- `401 Unauthorized`: Non authentifié
- `403 Forbidden`: Accès refusé
- `404 Not Found`: Ressource non trouvée
- `422 Unprocessable Entity`: Validation échouée
- `429 Too Many Requests`: Trop de requêtes

### Codes d'Erreur Serveur

- `500 Internal Server Error`: Erreur interne du serveur
- `502 Bad Gateway`: Erreur de passerelle
- `503 Service Unavailable`: Service indisponible

### Format des Erreurs

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "L'email est requis"
      }
    ]
  }
}
```

## Limitation de Taux

L'API implémente une limitation de taux pour prévenir les abus :

- **Endpoints d'authentification**: 5 requêtes par minute
- **Endpoints de contenu**: 100 requêtes par minute
- **Endpoints de progression**: 200 requêtes par minute

Les en-têtes suivants sont inclus dans chaque réponse :

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

L'API supporte les webhooks pour les événements de paiement :

### Webhook de Paiement Réussi

```http
POST /api/webhooks/polar/payment-success
```

**Corps de la requête** :

```json
{
  "event": "payment.success",
  "data": {
    "subscriptionId": "premium_monthly",
    "userId": "user_123",
    "amount": 5000,
    "currency": "XOF",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Webhook d'Abonnement Annulé

```http
POST /api/webhooks/polar/subscription-cancelled
```

**Corps de la requête** :

```json
{
  "event": "subscription.cancelled",
  "data": {
    "subscriptionId": "premium_monthly",
    "userId": "user_123",
    "cancelledAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## SDK Client

Pour faciliter l'intégration, nous fournissons un SDK client TypeScript :

### Installation

```bash
npm install @kurama/api-client
```

### Utilisation

```typescript
import { KuramaAPI } from '@kurama/api-client'

const api = new KuramaAPI({
  baseURL: 'https://back-kurama.yeko.workers.dev',
  token: 'votre-token'
})

// Obtenir le profil utilisateur
const profile = await api.user.getProfile()

// Obtenir les cartes à réviser
const dueCards = await api.user.getDueCards({ limit: 10 })

// Mettre à jour la progression
await api.user.updateProgress({
  cardId: 1,
  lessonId: 1,
  quality: 4
})
```

## Support

Pour toute question ou problème avec l'API :

- **Documentation**: [https://docs.kurama.ci/api](https://docs.kurama.ci/api)
- **Issues**: [GitHub Issues](https://github.com/yourusername/kurama/issues)
- **Email**: api-support@kurama.ci

Cette documentation est mise à jour régulièrement pour refléter les dernières fonctionnalités de l'API Kurama.