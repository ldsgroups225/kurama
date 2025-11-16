---
inclusion: manual
---

# Deployment & Infrastructure

## Production URLs

- **Frontend**: https://kurama.yeko.workers.dev
- **Backend**: https://back-kurama.yeko.workers.dev

## Deployment Architecture

### Frontend (Cloudflare Pages)
- **Build**: Vite with Cloudflare plugin
- **Runtime**: Node.js compatible
- **Entry**: `src/server.ts` (custom server)
- **Build Output**: `dist/` directory
- **Deployment**: `pnpm run deploy:kurama-frontend`

### Backend (Cloudflare Workers)
- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Entry**: `src/index.ts`
- **Bindings**: Database credentials, auth secrets
- **Deployment**: `pnpm run deploy:kurama-backend`

### Database
- **Primary**: PostgreSQL (Neon or PlanetScale)
- **Adapters**: Neon (serverless), PlanetScale (MySQL), SQLite (local)
- **ORM**: Drizzle with migrations
- **Credentials**: Stored as Cloudflare secrets

## Environment Variables

### Frontend (kurama-frontend)
```env
VITE_API_URL=https://back-kurama.yeko.workers.dev
VITE_APP_NAME=Kurama
```

### Backend (kurama-backend)
```env
DATABASE_HOST=your-host
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=https://kurama.yeko.workers.dev
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
POLAR_ACCESS_TOKEN=your-token
```

## Deployment Process

### Prerequisites
```bash
# Ensure logged in to Cloudflare
npx wrangler login

# Build data-ops (required)
pnpm run build:data-ops
```

### Deploy Commands
```bash
# Deploy backend
pnpm run deploy:kurama-backend

# Deploy frontend
pnpm run deploy:kurama-frontend

# Deploy both
pnpm run build:data-ops && \
pnpm run deploy:kurama-backend && \
pnpm run deploy:kurama-frontend
```

## CI/CD Setup

### GitHub Actions
- Automatic deployment on push to `main`
- PR preview deployments
- Test workflows on PRs
- Configured in `.github/workflows/`

### Setup Steps
1. Create Cloudflare API token (Edit Cloudflare Workers permission)
2. Add GitHub secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`: `6eba1152a9ffddc83690f84f367e0bc9`
3. Push workflows to GitHub

## Monitoring & Logs

### View Logs
```bash
# Frontend logs
npx wrangler tail kurama --format pretty

# Backend logs
npx wrangler tail back-kurama --format pretty
```

### Cloudflare Dashboard
- Analytics: Workers & Pages → kurama → Metrics
- Logs: Workers & Pages → kurama → Logs
- Deployments: Workers & Pages → kurama → Deployments

## Database Migrations

### Generate Migrations
```bash
pnpm run --filter @kurama/data-ops drizzle:generate
```

### Apply Migrations
```bash
pnpm run --filter @kurama/data-ops drizzle:migrate
```

### Pull Schema
```bash
pnpm run --filter @kurama/data-ops drizzle:pull
```

## Seeding Data

### Base Curriculum
```bash
pnpm run --filter @kurama/data-ops seed
```

### Core Lessons
```bash
pnpm run --filter @kurama/data-ops seed:lessons
```

### Extended Lessons
```bash
pnpm run --filter @kurama/data-ops seed:lessons:extended
```

### All Data
```bash
pnpm run --filter @kurama/data-ops seed:full
```

## Troubleshooting

### Authentication Issues
1. Verify Google OAuth redirect URI
2. Check environment variables are set
3. Review logs: `npx wrangler tail kurama`

### Database Connection Issues
1. Verify database credentials
2. Check database is accessible from Cloudflare
3. Test connection locally first

### Deployment Failures
1. Ensure data-ops is built
2. Check wrangler configuration
3. Verify Cloudflare account permissions
4. Review build logs for errors

### Performance Issues
1. Check bundle size: `pnpm run perf:check-bundles`
2. Analyze performance: `pnpm run perf:check`
3. Review Core Web Vitals in Cloudflare dashboard

## Rollback Procedure

### Rollback Frontend
1. Go to Cloudflare Pages dashboard
2. Select kurama project
3. Go to Deployments
4. Click "Rollback" on previous deployment

### Rollback Backend
1. Go to Cloudflare Workers dashboard
2. Select back-kurama worker
3. Go to Deployments
4. Click "Rollback" on previous deployment

## Performance Optimization

### Bundle Size
- Code splitting with lazy routes
- Tree shaking enabled
- Minification in production
- Image optimization

### Caching Strategy
- Static assets: Long-term caching
- API responses: TanStack Query caching
- Service worker: Workbox caching

### Database Optimization
- Query optimization with Drizzle
- Connection pooling (Neon/PlanetScale)
- Indexes on frequently queried columns

## Security

### Secrets Management
- Store in Cloudflare dashboard
- Never commit `.env` files
- Rotate tokens regularly
- Use least privilege access

### CORS Configuration
- Frontend and backend on same domain
- API routes under `/api/` path
- Better Auth handles auth routes

### Data Protection
- HTTPS enforced
- Database credentials encrypted
- User data encrypted at rest
- Regular backups

## Next Steps

- [ ] Set up custom domain (kurama.app)
- [ ] Configure Polar webhooks
- [ ] Set up monitoring and alerts
- [ ] Add staging environment
- [ ] Configure CDN caching rules
- [ ] Implement rate limiting
- [ ] Add DDoS protection
