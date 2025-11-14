# CI/CD Setup Guide

This project uses GitHub Actions for continuous integration and deployment to Cloudflare.

## Prerequisites

You need to add these secrets to your GitHub repository:

### Required Secrets

1. **CLOUDFLARE_API_TOKEN**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Or create custom token with permissions:
     - Account > Workers Scripts > Edit
     - Account > Cloudflare Pages > Edit
   - Copy the token

2. **CLOUDFLARE_ACCOUNT_ID**
   - Go to: https://dash.cloudflare.com
   - Select any domain or go to Workers & Pages
   - Find your Account ID in the right sidebar
   - Copy the Account ID

### Adding Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [your token]
   - Click **Add secret**
   
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: [your account ID]
   - Click **Add secret**

## Workflows

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch → Deploys to production
- Pull requests → Creates preview deployments

**What it does:**
- Installs dependencies
- Builds data-ops package
- Deploys backend to Cloudflare Workers
- Deploys frontend to Cloudflare Pages

**Production URLs:**
- Backend: https://back-kurama.yeko.workers.dev
- Frontend: https://kurama.yeko.workers.dev

**Preview URLs:**
- Created automatically for each PR
- Commented on the PR by Cloudflare bot

### 2. Test Workflow (`.github/workflows/test.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests

**What it does:**
- Runs type checking
- Runs linting
- Runs tests

## Manual Deployment

You can still deploy manually using:

```bash
# Deploy backend
pnpm run deploy:kurama-backend

# Deploy frontend
pnpm run deploy:kurama-frontend
```

## Environment Variables

Environment variables are managed in Cloudflare Dashboard:
- Go to: Workers & Pages → kurama → Settings → Environment Variables
- Add/update variables as needed
- Redeploy for changes to take effect

## Troubleshooting

### Deployment fails with "Unauthorized"
- Check that `CLOUDFLARE_API_TOKEN` is valid
- Ensure token has correct permissions

### Deployment fails with "Account not found"
- Verify `CLOUDFLARE_ACCOUNT_ID` is correct

### Build fails
- Check that all dependencies are in `package.json`
- Ensure `pnpm-lock.yaml` is committed

### Preview deployments not working
- Ensure PR is from the same repository (not a fork)
- Check workflow logs for errors

## Best Practices

1. **Always test locally before pushing:**
   ```bash
   pnpm run build:data-ops
   pnpm run dev:kurama-frontend
   pnpm run dev:kurama-backend
   ```

2. **Use pull requests for changes:**
   - Create a branch
   - Make changes
   - Open PR
   - Review preview deployment
   - Merge to main

3. **Monitor deployments:**
   - Check Actions tab for workflow status
   - Review Cloudflare dashboard for deployment logs

4. **Keep secrets secure:**
   - Never commit API tokens
   - Rotate tokens periodically
   - Use least-privilege permissions
