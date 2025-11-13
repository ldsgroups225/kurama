<div align="center">
  <img src="assets/images/logo.png" alt="Kurama Logo" width="120" />
  <h1>Kurama</h1>
  <p><strong>Préparez votre BEPC/BAC avec la répétition espacée.</strong></p>
  <p>The ultimate web-based study platform for students in Côte d'Ivoire, built with TanStack Start, Drizzle ORM + PostgreSQL, and Tailwind CSS.</p>
</div>

A monorepo SaaS application designed as an offline-first Progressive Web Application for students preparing for their BEPC (Brevet d'Études du Premier Cycle) and BAC (Baccalauréat) examinations in Côte d'Ivoire.

## 🚀 Key Features

### 🎓 Educational Excellence
- **Ministry-Aligned Content**: Pre-populated study sets for BEPC and BAC aligned with the official Côte d'Ivoire Ministry of Education programs
- **Comprehensive Subject Coverage**: Mathematics, Sciences, Languages, History, Geography, and more
- **Regular Content Updates**: New materials added based on curriculum changes

### 🧠 Smart Learning
- **Spaced Repetition (SM-2)**: Scientifically proven algorithm that shows you cards right before you forget them
- **Adaptive Difficulty**: System adjusts based on your performance
- **Learning Analytics**: Track your progress with detailed statistics and insights

### 📱 Study Modes
- **Flashcards**: Classic card-flipping for active recall
- **Quizzes**: Multiple-choice questions with instant feedback
- **Timed Matching**: Race against the clock to match terms
- **Exam Simulator**: Full-length practice exams that mirror real test conditions

### 👥 Social Learning
- **Study Groups**: Create or join collaborative study groups
- **Shared Sets**: Share and discover study materials from peers
- **Leaderboards**: Compete with friends and classmates
- **Progress Sharing**: Celebrate achievements together

### 💪 Technical Excellence
- **Offline-First PWA**: Study anywhere, anytime - your progress syncs automatically when online
- **Cross-Platform**: Works seamlessly on desktop, mobile, and tablet
- **Fast & Responsive**: Optimized for smooth performance even on slower connections

## 🛠️ Tech Stack

**Frontend (user-application)**:
- TanStack Start - Full-stack React framework with file-based routing
- React 19 with TypeScript
- TanStack Router & Query with SSR integration
- Tailwind CSS v4 with Shadcn components
- Better Auth for authentication
- Vite for build tooling

**Backend (data-service)**:
- Hono web framework for Cloudflare Workers
- TypeScript
- Shared data-ops package for database operations

**Shared (data-ops)**:
- Drizzle ORM with PostgreSQL
- Better Auth integration
- Zod for schema validation
- Multiple database adapters (Neon, Planetscale, SQLite)

## 📋 Setup

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (or use managed service like Neon)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kurama.git
cd kurama

# Install dependencies and build required packages
pnpm run setup
```

### Environment Configuration

Create your environment file:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kurama"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Kurama"
```

## 💻 Development

### User Application
```bash
pnpm run dev:user-application
```
Starts the frontend development server on port 3000.

### Data Service
```bash
pnpm run dev:data-service
```
Starts the backend API service with Cloudflare Workers.

### Data Ops Development
```bash
# Build the data-ops package
pnpm run --filter @kurama/data-ops build

# Generate database migrations
pnpm run --filter @kurama/data-ops drizzle:generate

# Run database migrations
pnpm run --filter @kurama/data-ops drizzle:migrate

# Generate auth schema
pnpm run --filter @kurama/data-ops better-auth:generate
```

## 🚀 Deployment

### User Application (Cloudflare Pages)
```bash
pnpm run deploy:user-application
```

### Data Service (Cloudflare Workers)
```bash
pnpm run deploy:data-service
```

## 🏗️ Project Structure

```
kurama/
├── apps/
│   ├── user-application/     # TanStack Start frontend
│   └── data-service/         # Hono API backend
├── packages/
│   └── data-ops/            # Shared utilities (auth, database, schemas)
└── docs/                    # Documentation
```

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for students in Côte d'Ivoire</p>
  <p>
    <a href="https://kurama.app">Website</a> •
    <a href="https://docs.kurama.app">Documentation</a> •
    <a href="https://twitter.com/kurama">Twitter</a> •
    <a href="https://discord.gg/kurama">Discord</a>
  </p>
  <p>
    <sub>Star ⭐ the repo if you find it useful!</sub>
  </p>
</div>
