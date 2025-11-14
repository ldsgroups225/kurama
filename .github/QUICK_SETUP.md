# Quick CI/CD Setup

## Your Cloudflare Details

**Account ID:** `6eba1152a9ffddc83690f84f367e0bc9`

## Step-by-Step Setup

### 1. Create Cloudflare API Token

```bash
# Open this URL in your browser:
https://dash.cloudflare.com/profile/api-tokens
```

1. Click **"Create Token"**
2. Use template: **"Edit Cloudflare Workers"**
3. Or create custom token with these permissions:
   - Account > Workers Scripts > Edit
   - Account > Cloudflare Pages > Edit
4. Click **"Continue to summary"**
5. Click **"Create Token"**
6. **Copy the token** (you won't see it again!)

### 2. Add Secrets to GitHub

```bash
# Open your GitHub repository settings:
https://github.com/YOUR_USERNAME/Kurama/settings/secrets/actions
```

Click **"New repository secret"** and add:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [paste the token you just created]

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `6eba1152a9ffddc83690f84f367e0bc9`

### 3. Test the Setup

1. Commit and push the workflow files:
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows"
   git push origin main
   ```

2. Go to your repository's **Actions** tab
3. You should see the workflows running

### 4. Verify Deployment

Once the workflow completes:
- ✅ Backend: https://back-kurama.yeko.workers.dev
- ✅ Frontend: https://kurama.yeko.workers.dev

## What Happens Next?

### On every push to `main`:
- Runs tests
- Deploys backend to production
- Deploys frontend to production

### On every pull request:
- Runs tests
- Creates preview deployments
- Comments preview URLs on the PR

## Troubleshooting

If deployment fails, check:
1. Secrets are correctly added in GitHub
2. API token has correct permissions
3. Workflow logs in Actions tab

## Need Help?

Check the full guide: `.github/CICD_SETUP.md`
