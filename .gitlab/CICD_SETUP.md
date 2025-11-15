# GitLab CI/CD Setup for Kurama

This guide explains how to set up CI/CD for the Kurama project on GitLab.

## Pipeline Overview

The pipeline consists of three stages:

1. **Test**: Run type checking, linting, and tests
2. **Build**: Build the frontend application
3. **Deploy**: Deploy to Cloudflare (backend and frontend)

## Required CI/CD Variables

You need to configure the following variables in GitLab:

### Navigate to: Settings → CI/CD → Variables

Add these variables:

| Variable Name | Description | Protected | Masked |
|--------------|-------------|-----------|--------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token | ✅ | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | ✅ | ❌ |

### How to Get Cloudflare Credentials

#### 1. Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Add these permissions:
   - Account → Cloudflare Pages → Edit
   - Account → Cloudflare Workers Scripts → Edit
5. Set Account Resources to your account
6. Create token and copy it

#### 2. Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain/account
3. Scroll down on the right sidebar
4. Copy your Account ID

## Pipeline Behavior

### On Push to Main Branch
- ✅ Run tests
- ✅ Build frontend
- ✅ Deploy backend to production
- ✅ Deploy frontend to production

### On Merge Request
- ✅ Run tests
- ✅ Build frontend
- ✅ Deploy backend to preview environment
- ✅ Deploy frontend to preview environment
- 🔗 Preview URLs are available in the merge request

### Manual Actions
- 🧹 Cleanup preview environments (manual trigger)

## Environment URLs

### Production
- **Frontend**: https://kurama.app
- **Backend**: https://api.kurama.app

### Preview (Merge Requests)
- **Frontend**: https://preview-{MR_NUMBER}.kurama.pages.dev
- **Backend**: https://preview-api.kurama.app

## Caching

The pipeline uses pnpm store caching to speed up builds:
- Cache key based on `pnpm-lock.yaml`
- Cached paths: `.pnpm-store`, `node_modules`, workspace node_modules

## Troubleshooting

### Pipeline Fails on Deploy

**Check:**
1. Are CI/CD variables set correctly?
2. Is the Cloudflare API token valid?
3. Do you have the correct permissions?

### Build Fails

**Check:**
1. Is `pnpm-lock.yaml` up to date?
2. Run `pnpm install` locally to verify dependencies
3. Check if `data-ops` package builds successfully

### Preview Environments Not Working

**Check:**
1. Merge request must be open
2. Source branch must be up to date
3. Check Cloudflare Pages settings

## Local Testing

Test the pipeline locally before pushing:

```bash
# Install dependencies
pnpm install

# Build data-ops
pnpm run build:data-ops

# Run tests
pnpm run typecheck
pnpm run lint
pnpm run test

# Build frontend
cd apps/user-application
pnpm run build
```

## Additional Configuration

### Protected Branches

Configure protected branches in: Settings → Repository → Protected branches

Recommended:
- Protect `main` branch
- Require merge request approval
- Require pipeline success

### Merge Request Settings

Configure in: Settings → Merge requests

Recommended:
- Enable "Pipelines must succeed"
- Enable "All discussions must be resolved"
- Enable "Delete source branch" option

## Monitoring

View pipeline status:
- **Pipelines**: CI/CD → Pipelines
- **Environments**: Deployments → Environments
- **Jobs**: CI/CD → Jobs

## Next Steps

1. ✅ Add CI/CD variables
2. ✅ Push `.gitlab-ci.yml` to repository
3. ✅ Create a test merge request
4. ✅ Verify pipeline runs successfully
5. ✅ Check preview deployments
6. ✅ Merge to main and verify production deployment
