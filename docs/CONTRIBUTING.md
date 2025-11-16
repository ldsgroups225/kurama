# Guide de Contribution

Merci de votre intérêt pour contribuer à Kurama ! Ce guide vous aidera à comprendre comment participer au projet de manière efficace et respectueuse des standards de l'équipe.

## Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Processus de Review](#processus-de-review)
- [Questions et Support](#questions-et-support)

## Code de Conduite

### Nos Principes

Nous nous engageons à fournir un environnement accueillant et inclusif pour tous les contributeurs. En participant à ce projet, vous acceptez de respecter notre code de conduite :

- **Respect** : Traitez tous les participants avec respect et considération
- **Inclusivité** : Soyez accueillant envers les nouveaux contributeurs
- **Collaboration** : Travaillez ensemble pour résoudre les problèmes
- **Focus Technique** : Concentrez-vous sur ce qui est le mieux pour la communauté
- **Respect de la Vie Privée** : Ne partagez pas d'informations privées

### Comportements Attendus

- Utiliser un langage inclusif et respectueux
- Accepter les critiques constructives avec élégance
- Se concentrer sur ce qui est le mieux pour la communauté
- Montrer de l'empathie envers les autres membres de la communauté

### Comportements Inappropriés

- Langage ou images sexuelles, ou toute forme de harcèlement
- Trolls, commentaires insultants ou attaques personnelles
- Publication d'informations privées d'autres personnes
- Tout autre conduite qui pourrait raisonnablement être considérée comme inappropriée

### Signalement

Pour signaler un comportement inapproprié, contactez-nous à : conduct@kurama.ci

## Comment Contribuer

### Types de Contributions

Nous apprécions tous les types de contributions :

1. **Code** : Nouvelles fonctionnalités, corrections de bugs
2. **Documentation** : Amélioration de la documentation
3. **Tests** : Ajout de tests pour améliorer la couverture
4. **Traductions** : Aide à la traduction du contenu
5. **Rapports de Bugs** : Signalement de problèmes
6. **Suggestions** : Idées pour améliorer le projet

### Pour Commencer

1. **Fork le repository** sur GitHub
2. **Clonez votre fork** localement
3. **Créez une branche** pour votre contribution
4. **Faites vos changements** en suivant les standards
5. **Testez vos changements** thoroughly
6. **Soumettez une Pull Request**

## Processus de Développement

### 1. Configuration de l'Environnement

Suivez le [Guide de Développement](./DEVELOPMENT.md) pour configurer votre environnement local.

### 2. Branches

Nous utilisons une stratégie de branching Git Flow :

```
main                 # Branche de production
├── develop          # Branche de développement
├── feature/*        # Nouvelles fonctionnalités
├── bugfix/*         # Corrections de bugs
├── hotfix/*         # Corrections urgentes
└── release/*        # Préparation de releases
```

#### Conventions de Branches

- **feature/nom-fonctionnalité** : Pour les nouvelles fonctionnalités
- **bugfix/description-bug** : Pour les corrections de bugs
- **hotfix/correction-urgente** : Pour les corrections critiques
- **release/version-x.y.z** : Pour la préparation de releases

### 3. Workflow de Développement

#### Pour une Nouvelle Fonctionnalité

```bash
# 1. Synchroniser avec le repository upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# 2. Créer une branche de fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# 3. Développer la fonctionnalité
# Faire vos changements...

# 4. Committer vos changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 5. Pousser votre branche
git push origin feature/nouvelle-fonctionnalite

# 6. Créer une Pull Request
```

#### Pour une Correction de Bug

```bash
# 1. Créer une branche de bugfix
git checkout -b bugfix/correction-login

# 2. Corriger le bug
# Faire les corrections...

# 3. Ajouter des tests pour le bug
# Écrire des tests...

# 4. Committer
git commit -m "fix: correction du bug de connexion"

# 5. Pousser et créer une PR
git push origin bugfix/correction-login
```

### 4. Conventions de Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) pour standardiser nos messages de commit :

#### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Changement de documentation
- `style`: Changement de style (formatage, point-virgule manquant, etc.)
- `refactor`: Changement de code qui ne corrige ni un bug ni n'ajoute une fonctionnalité
- `perf`: Amélioration de performance
- `test`: Ajout ou modification de tests
- `chore`: Changement dans le processus de build ou gestion des dépendances
- `ci`: Changement dans la configuration CI

#### Exemples

```bash
feat(auth): ajouter support de l'authentification Google OAuth

fix: corriger le bug de connexion lorsque l'email est invalide

docs(api): mettre à jour la documentation de l'endpoint /user/profile

refactor(database): optimiser les requêtes de sélection des leçons

test(lessons): ajouter des tests pour la création de leçons
```

## Standards de Code

### TypeScript

#### Configuration

- **Strict mode** activé
- **Pas de any** sauf cas exceptionnels documentés
- **Typage explicite** pour les retours de fonctions

#### Exemples

```typescript
// ✅ Bon
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

const getUserById = async (id: string): Promise<User | null> => {
  // Implémentation...
}

// ❌ Mauvais
const getUserById = async (id) => {
  // Pas de typage...
}
```

### React

#### Composants Fonctionnels

Utilisez des composants fonctionnels avec des hooks :

```typescript
// ✅ Bon
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ❌ Mauvais
class Button extends React.Component {
  // Éviter les composants classe
}
```

#### Hooks Personnalisés

```typescript
// ✅ Bon
interface UseAuthReturn {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Implémentation...
  
  return { user, login, logout, loading }
}
```

### CSS et Styling

#### Tailwind CSS

Utilisez Tailwind CSS avec des composants Shadcn/UI :

```typescript
// ✅ Bon
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">
    Titre
  </h2>
  <Button variant="primary">
    Action
  </Button>
</div>

// ❌ Mauvais
<div style={{ display: 'flex', padding: '16px' }}>
  {/* Éviter le style inline */}
</div>
```

#### Composants Réutilisables

Créez des composants réutilisables avec des variantes :

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = 'rounded-lg p-6'
  const variantClasses = {
    default: 'bg-white',
    outlined: 'border border-gray-200 bg-white',
    elevated: 'bg-white shadow-lg'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}
```

### Structure des Fichiers

#### Frontend

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables
│   ├── auth/            # Composants d'authentification
│   └── forms/           # Composants de formulaire
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires et fonctions
├── routes/              # Routes TanStack Router
├── core/                # Logique métier
└── styles/              # Styles globaux
```

#### Backend

```
src/
├── routes/              # Routes API
├── middleware/          # Middleware
├── services/            # Services métier
├── utils/               # Utilitaires
└── types/               # Types TypeScript
```

## Tests

### Types de Tests

1. **Tests Unitaires** : Test de fonctions isolées
2. **Tests d'Intégration** : Test d'interaction entre composants
3. **Tests End-to-End** : Test de flux utilisateur complets

### Frameworks

- **Frontend** : Vitest + Testing Library
- **Backend** : Vitest

### Écriture de Tests

#### Tests Unitaires

```typescript
// apps/user-application/src/lib/__tests__/spaced-repetition.test.ts
import { describe, it, expect } from 'vitest'
import { calculateNextReview } from '../spaced-repetition'

describe('calculateNextReview', () => {
  it('should calculate correct interval for first repetition', () => {
    const result = calculateNextReview(5)
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })
  
  it('should reset repetitions for quality < 3', () => {
    const progress = { repetitions: 2, interval: 6 }
    const result = calculateNextReview(2, progress)
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(0)
  })
})
```

#### Tests de Composants

```typescript
// apps/user-application/src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Tests d'API

```typescript
// apps/data-service/src/routes/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../app'

describe('Auth Routes', () => {
  beforeEach(() => {
    // Setup avant chaque test
  })
  
  it('should send OTP for valid email', async () => {
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
```

### Couverture de Tests

- Objectif : **80%** de couverture minimum
- Tests critiques : **95%** de couverture
- Nouveau code : Doit inclure des tests

### Exécution des Tests

```bash
# Exécuter tous les tests
pnpm test

# Exécuter en mode watch
pnpm test:watch

# Voir la couverture
pnpm test:coverage

# Exécuter pour un package spécifique
pnpm --filter kurama-frontend test
```

## Documentation

### Types de Documentation

1. **Code Comments** : Commentaires dans le code
2. **API Documentation** : Documentation des endpoints API
3. **User Documentation** : Guides pour les utilisateurs
4. **Developer Documentation** : Guides pour les développeurs

### Standards de Documentation

#### Comments de Code

```typescript
/**
 * Calcule la prochaine révision selon l'algorithme SM-2
 * 
 * @param quality - Qualité de la réponse (0-5)
 * @param progress - Progression actuelle de la carte
 * @returns Prochaine révision calculée
 * 
 * @example
 * ```typescript
 * const result = calculateNextReview(4, { repetitions: 1 })
 * console.log(result.interval) // 6
 * ```
 */
export const calculateNextReview = (
  quality: number,
  progress?: CardProgress
): SM2Result => {
  // Implémentation...
}
```

#### Documentation API

```markdown
## Obtenir le Profil Utilisateur

### Endpoint
```
GET /api/user/profile
```

### Description
Récupère le profil de l'utilisateur authentifié.

### Headers
- `Authorization: Bearer <token>` (requis)

### Réponse
```json
{
  "id": "user_123",
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

### Erreurs
- `401 Unauthorized` : Non authentifié
- `404 Not Found` : Utilisateur non trouvé
```

#### Mise à Jour de la Documentation

Quand vous ajoutez une nouvelle fonctionnalité :

1. **Mettez à jour** le README si nécessaire
2. **Ajoutez** la documentation API dans `docs/API.md`
3. **Documentez** les changements dans `CHANGELOG.md`
4. **Ajoutez** des exemples d'utilisation

## Processus de Review

### Pull Request

#### Avant de Soumettre

- [ ] Tests passent localement
- [ ] Code suit les standards du projet
- [ ] Documentation mise à jour
- [ ] Commits suivent les conventions
- [ ] Branche à jour avec `develop`

#### Template de PR

```markdown
## Description
Description brève de la modification...

## Type de Changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests d'intégration ajoutés/modifiés
- [ ] Tests manuels effectués

## Checklist
- [ ] Code suit les standards de style
- [ ] Auto-review des modifications passées
- [ ] Documentation mise à jour

## Issues Connexes
Closes #123
```

### Processus de Review

#### Reviewers

- **Au moins 2 reviewers** requis pour merger
- **1 reviewer senior** pour les changements importants
- **Reviewers assignés** selon l'expertise

#### Critères de Review

1. **Fonctionnalité** : Le code fait-il ce qu'il est censé faire ?
2. **Performance** : Y a-t-il des problèmes de performance ?
3. **Sécurité** : Y a-t-il des vulnérabilités ?
4. **Tests** : Les tests sont-ils adéquats ?
5. **Documentation** : La documentation est-elle à jour ?

#### Feedback

- **Constructif** : Focus sur l'amélioration
- **Spécifique** : Indiquez exactement quoi changer
- **Respectueux** : Soyez professionnel dans vos commentaires

### Merge

#### Conditions de Merge

- Tous les tests passent
- Review approuvé par les reviewers requis
- Pas de conflits avec la branche cible
- Documentation à jour

#### Types de Merge

- **Squash and merge** : Pour les petites features
- **Merge commit** : Pour les features importantes
- **Rebase and merge** : Pour les hotfixs

## Questions et Support

### Obtenir de l'Aide

1. **Documentation** : Consultez d'abord la documentation
2. **Issues** : Cherchez dans les issues existantes
3. **Discussions** : Posez des questions dans GitHub Discussions
4. **Discord** : Rejoignez notre serveur Discord (lien dans README)

### Signalement de Bugs

Pour signaler un bug :

1. **Vérifiez** si le bug n'est pas déjà signalé
2. **Utilisez** le template de bug report
3. **Fournissez** :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Environnement (OS, navigateur, version)
   - Screenshots si applicable

### Suggestions d'Amélioration

Pour suggérer une amélioration :

1. **Vérifiez** si l'idée n'a pas déjà été proposée
2. **Utilisez** le template de feature request
3. **Expliquez** :
   - Le problème que vous essayez de résoudre
   - Pourquoi cette amélioration est importante
   - Comment vous imaginez la solution

## Reconnaissance

### Contributeurs

Nous reconnaissons toutes les contributions dans :

- **README.md** : Liste des contributeurs
- **CHANGELOG.md** : Historique des changements
- **Release Notes** : Notes de version

### Badges

Les contributeurs actifs reçoivent des badges :

- 🌟 **Core Contributor** : Contributions régulières
- 🚀 **Feature Champion** : Nouvelles fonctionnalités majeures
- 🐛 **Bug Hunter** : Corrections de bugs importantes
- 📚 **Documentation Hero** : Améliorations significatives de la documentation

Merci de contribuer à Kurama ! Votre participation nous aide à créer une meilleure plateforme éducative pour les étudiants en Côte d'Ivoire.