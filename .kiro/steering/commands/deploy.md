---
inclusion: manual
---

# Deploy Application

Deploy Kurama to Cloudflare Pages (frontend) and Cloudflare Workers (backend) with proper verification and rollback procedures.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `pnpm test`
- [ ] No type errors: `pnpm run typecheck`
- [ ] No lint errors: `pnpm run lint:fix`
- [ ] Bundle size acceptable: `pnpm run perf:check-bundles`

### Data Operations
- [ ] Database migrations applied: `pnpm run --filter @kurama/data-ops drizzle:migrate`
- [ ] Seed data updated if needed
- [ ] Better Auth schema current: `pnpm run --filter @kurama/data-ops better-auth:generate`

### Environment Variables
Verify these are set in Cloudflare dashboard:

#### Frontend (Pages)
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Better Auth secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `POLAR_ACCESS_TOKEN` - Polar SDK access token

#### Backend (Workers)
- Same environment variables as frontend
- Additional worker-specific bindings if needed

## Deployment Commands

### Frontend Deployment (Cloudflare Pages)
```bash
# Deploy kurama-frontend
pnpm run deploy:kurama-frontend

# This runs:
# 1. pnpm run build:data-ops (rebuild shared package)
# 2. pnpm run build (build frontend)
# 3. wrangler pages deploy (deploy to Pages)
```

**URL**: https://kurama.yeko.workers.dev

### Backend Deployment (Cloudflare Workers)
```bash
# Deploy kurama-backend
pnpm run deploy:kurama-backend

# This runs:
# 1. pnpm run build:data-ops (rebuild shared package)
# 2. wrangler deploy (deploy to Workers)
```

**URL**: https://back-kurama.yeko.workers.dev

### Full Deployment
```bash
# Deploy both frontend and backend
pnpm run deploy:kurama-frontend
pnpm run deploy:kurama-backend
```

## Post-Deployment Verification

### Health Checks
1. **Frontend Health**:
   - Visit https://kurama.yeko.workers.dev
   - Verify landing page loads
   - Check console for errors

2. **Backend Health**:
   - Visit https://back-kurama.yeko.workers.dev/health
   - Should return 200 OK

### Critical Flow Testing
1. **Authentication**:
   - Test email OTP login
   - Test Google OAuth login
   - Verify session persistence

2. **Learning Flow**:
   - Navigate to subjects
   - Start a lesson
   - Complete flashcard session
   - Check XP/progress updates

3. **Payment Flow** (if applicable):
   - Test subscription checkout
   - Verify webhook handling
   - Check subscription status

### Performance Verification
- Check Core Web Vitals
- Verify page load times < 3s
- Test on mobile devices
- Verify PWA functionality

## Monitoring and Alerts

### Cloudflare Analytics
- Monitor request volume
- Check error rates
- Review performance metrics

### Error Tracking
- Check Cloudflare Workers logs
- Monitor console errors
- Review user feedback

## Rollback Procedures

### Frontend Rollback
1. Go to Cloudflare Pages dashboard
2. Find previous deployment
3. Click "Rollback to this deployment"
4. Verify rollback successful

### Backend Rollback
1. Go to Cloudflare Workers dashboard
2. Find previous version
3. Deploy previous version
4. Update environment variables if needed

### Database Rollback
If database changes were made:
1. Restore from backup if needed
2. Run rollback migrations
3. Verify data integrity

## Deployment Environments

### Staging (Optional)
For testing before production:
```bash
# Deploy to staging environment
wrangler pages deploy --env staging
wrangler deploy --env staging
```

### Production
Main deployment commands above deploy to production.

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear node_modules and rebuild
rm -rf node_modules
pnpm install
pnpm run build:data-ops
```

### Environment Variable Issues
- Verify all required variables are set
- Check variable names match exactly
- Ensure secrets are properly encoded

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is accessible from Cloudflare
- Test connection with simple query

### Authentication Issues
- Verify AUTH_SECRET is set
- Check Google OAuth credentials
- Test redirect URLs are correct

## Security Considerations

### Secrets Management
- Never commit secrets to git
- Use Cloudflare environment variables
- Rotate secrets regularly

### CORS Configuration
- Verify allowed origins
- Check credential handling
- Test cross-origin requests

### Content Security Policy
- Review CSP headers
- Test for XSS protection
- Verify resource loading

## Performance Optimization

### Caching Strategy
- Configure Cloudflare caching rules
- Set appropriate cache headers
- Use CDN for static assets

### Bundle Optimization
- Check bundle sizes regularly
- Implement code splitting
- Remove unused dependencies

## Documentation Updates

After successful deployment:
- Update deployment logs
- Document any issues encountered
- Update runbooks if needed
- Share deployment notes with team
