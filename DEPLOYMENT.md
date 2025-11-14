# Kurama Deployment Guide

## 🚀 Production URLs

- **Frontend:** https://kurama.yeko.workers.dev
- **Backend:** https://back-kurama.yeko.workers.dev

## 📋 Deployment Status

### ✅ Completed Setup

1. **Cloudflare Workers Configuration**
   - Backend worker: `back-kurama`
   - Frontend worker: `kurama`
   - Environment variables configured in Cloudflare dashboard

2. **Authentication Setup**
   - Better Auth configured
   - Google OAuth enabled
   - Redirect URI: `https://kurama.yeko.workers.dev/api/auth/callback/google`

3. **Database Connection**
   - Database credentials stored as secrets
   - Drizzle ORM configured

## 🔧 Manual Deployment

### Prerequisites
```bash
# Ensure you're logged in to Cloudflare
npx wrangler login

# Build data-ops package
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

## 🤖 CI/CD Setup

GitHub Actions workflows are configured for automatic deployments.

### Setup Instructions

1. **Create Cloudflare API Token:**
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit Cloudflare Workers" template
   - Copy the token

2. **Add GitHub Secrets:**
   - Go to: Repository Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN`: [your token]
   - Add `CLOUDFLARE_ACCOUNT_ID`: `6eba1152a9ffddc83690f84f367e0bc9`

3. **Push to GitHub:**
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows"
   git push origin main
   ```

### Workflows

- **Deploy Workflow:** Deploys on push to `main`
- **Test Workflow:** Runs tests on PRs and pushes
- **Preview Deployments:** Creates preview for each PR

See `.github/QUICK_SETUP.md` for detailed instructions.

## 🔐 Environment Variables

Configured in Cloudflare Dashboard (Workers & Pages → kurama → Settings):

### Production Variables
- `DATABASE_HOST` (Text)
- `DATABASE_USERNAME` (Secret)
- `DATABASE_PASSWORD` (Secret)
- `BETTER_AUTH_SECRET` (Secret)
- `GOOGLE_CLIENT_ID` (Text)
- `GOOGLE_CLIENT_SECRET` (Secret)
- `POLAR_ACCESS_TOKEN` (Secret) - if using Polar

## 🔍 Monitoring & Logs

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

## 🐛 Troubleshooting

### Authentication Issues
1. Verify Google OAuth redirect URI is correct
2. Check environment variables are set
3. Review logs: `npx wrangler tail kurama`

### Database Connection Issues
1. Verify database credentials
2. Check database is accessible from Cloudflare
3. Test connection locally first

### Deployment Failures
1. Ensure data-ops is built: `pnpm run build:data-ops`
2. Check wrangler configuration
3. Verify Cloudflare account permissions

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [TanStack Start Docs](https://tanstack.com/start)
- [Better Auth Docs](https://www.better-auth.com/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🔄 Update Workflow

1. Make changes locally
2. Test: `pnpm run dev:kurama-frontend`
3. Build: `pnpm run build:data-ops`
4. Deploy: `pnpm run deploy:kurama-frontend`
5. Or push to GitHub for automatic deployment

## 🎯 Next Steps

- [ ] Set up custom domain (e.g., kurama.app)
- [ ] Configure Polar webhooks
- [ ] Set up monitoring and alerts
- [ ] Add staging environment
- [ ] Configure CDN caching rules
