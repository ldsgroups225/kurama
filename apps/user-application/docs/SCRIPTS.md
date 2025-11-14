# Package Scripts Reference

This document describes all available npm scripts for the Kurama user application.

## Development Scripts

### `pnpm run dev`
Start the development server on port 3000.

```bash
pnpm run dev
```

Features:
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- Tailwind CSS with JIT compilation

### `pnpm run serve`
Preview the production build locally.

```bash
pnpm run serve
```

Use this to test the production build before deployment.

## Build Scripts

### `pnpm run build`
Create a production build.

```bash
pnpm run build
```

Output: `dist/` directory with optimized bundles.

### `pnpm run build:production`
Create a production build with performance validation.

```bash
pnpm run build:production
```

This script:
1. Builds the application
2. Validates bundle sizes against performance budgets
3. Fails if budgets are exceeded

**Use this for CI/CD pipelines.**

### `pnpm run build:analyze`
Build and open the bundle analysis report.

```bash
pnpm run build:analyze
```

Opens `dist/stats.html` with an interactive visualization of:
- Bundle composition
- Module sizes
- Dependencies
- Gzipped sizes

## Bundle Analysis

### `pnpm run analyze`
Build in production mode and analyze bundles.

```bash
pnpm run analyze
```

Same as `build:analyze` but explicitly uses production mode.

## Performance Scripts

### `pnpm run perf:check`
Display performance budgets and optimization tips.

```bash
pnpm run perf:check
```

Shows:
- Core Web Vitals targets
- Bundle size budgets
- Route performance targets
- Optimization recommendations

### `pnpm run perf:check-bundles`
Validate bundle sizes against budgets.

```bash
pnpm run perf:check-bundles
```

**Prerequisites:** Must run after `pnpm run build`

This script:
1. Analyzes bundles in `dist/client/assets`
2. Calculates gzipped sizes
3. Compares against budgets
4. Reports violations
5. Exits with error if budgets exceeded

### `pnpm run perf:validate`
Build and validate performance in one command.

```bash
pnpm run perf:validate
```

Equivalent to:
```bash
pnpm run build && pnpm run perf:check-bundles
```

## Testing Scripts

### `pnpm run test`
Run all tests once.

```bash
pnpm run test
```

Uses Vitest with:
- React Testing Library
- jsdom environment
- Coverage reporting (optional)

### `pnpm run test:watch`
Run tests in watch mode.

```bash
pnpm run test:watch
```

Automatically re-runs tests when files change.

## Type Checking

### `pnpm run typecheck`
Run TypeScript type checking without emitting files.

```bash
pnpm run typecheck
```

Useful for:
- CI/CD pipelines
- Pre-commit hooks
- Manual type validation

### `pnpm run cf-typegen`
Generate TypeScript types for Cloudflare Workers environment.

```bash
pnpm run cf-typegen
```

Generates types based on `wrangler.jsonc` configuration.

## Deployment

### `pnpm run deploy`
Build and deploy to Cloudflare Pages.

```bash
pnpm run deploy
```

This script:
1. Runs `build:production` (includes performance validation)
2. Deploys to Cloudflare using Wrangler

**Prerequisites:**
- Wrangler CLI configured
- Cloudflare account authenticated
- `wrangler.jsonc` properly configured

## Common Workflows

### Development Workflow

```bash
# Start development server
pnpm run dev

# In another terminal, run type checking
pnpm run typecheck

# Run tests in watch mode
pnpm run test:watch
```

### Pre-Deployment Workflow

```bash
# 1. Type check
pnpm run typecheck

# 2. Run tests
pnpm run test

# 3. Build with performance validation
pnpm run build:production

# 4. Preview locally
pnpm run serve

# 5. Deploy
pnpm run deploy
```

### Performance Optimization Workflow

```bash
# 1. Check current budgets
pnpm run perf:check

# 2. Build and analyze
pnpm run analyze

# 3. Make optimizations

# 4. Validate improvements
pnpm run perf:validate
```

### Bundle Analysis Workflow

```bash
# 1. Build with analysis
pnpm run build:analyze

# 2. Review the treemap in browser
# Look for:
#   - Large dependencies
#   - Duplicate modules
#   - Opportunities for code splitting

# 3. Check bundle sizes
pnpm run perf:check-bundles
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm run typecheck
      
      - name: Run tests
        run: pnpm run test
      
      - name: Build with performance validation
        run: pnpm run build:production
      
      - name: Upload bundle analysis
        uses: actions/upload-artifact@v3
        with:
          name: bundle-analysis
          path: dist/stats.html
```

## Script Dependencies

Some scripts require others to run first:

| Script | Prerequisites |
|--------|---------------|
| `perf:check-bundles` | `build` |
| `serve` | `build` |
| `deploy` | None (runs `build:production` internally) |

## Environment Variables

Scripts may use these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Development server port | `3000` |
| `VITE_*` | Vite environment variables | - |

## Troubleshooting

### "Cannot find module" errors

```bash
# Reinstall dependencies
pnpm install

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build fails with memory errors

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build
```

### Perform
