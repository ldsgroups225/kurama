# Performance Budgets

This document describes the performance budgets for the Kurama user application and how to validate them.

## Overview

Performance budgets help ensure the application remains fast and responsive by setting limits on:
- Bundle sizes
- Core Web Vitals metrics
- Route load times

## Budget Targets

### Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Time until the largest content element is visible |
| FID (First Input Delay) | ≤ 100ms | Time from first user interaction to browser response |
| INP (Interaction to Next Paint) | ≤ 200ms | Responsiveness to user interactions |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability during page load |
| TTFB (Time to First Byte) | ≤ 800ms | Server response time |

### Bundle Size Budgets (Gzipped)

| Bundle | Target | Description |
|--------|--------|-------------|
| main | ≤ 150 KB | Core runtime and router |
| landing | ≤ 50 KB | Landing page route |
| auth | ≤ 30 KB | Authentication components |
| onboarding | ≤ 40 KB | Onboarding flow |
| app-dashboard | ≤ 60 KB | Main app dashboard |
| profile | ≤ 30 KB | Profile page |
| lessons | ≤ 40 KB | Lessons page |
| groups | ≤ 35 KB | Groups page |
| progress | ≤ 35 KB | Progress tracking |
| vendor-react | ≤ 50 KB | React and React DOM |
| vendor-tanstack | ≤ 35 KB | TanStack Router and Query |
| vendor-radix | ≤ 40 KB | Radix UI components |
| vendor-ui | ≤ 15 KB | UI utilities |

**Total Initial Load Target:** ≤ 250 KB (gzipped)

### Route Performance

| Metric | Target |
|--------|--------|
| Route Load Time | ≤ 3s |
| Time to Interactive | ≤ 3s |

## Validation Scripts

### Check Performance Budgets

Display all performance budgets and optimization tips:

```bash
pnpm run perf:check
```

### Check Bundle Sizes

Validate bundle sizes after a production build:

```bash
pnpm run perf:check-bundles
```

This script will:
1. Analyze all JavaScript bundles in `dist/client/assets`
2. Calculate gzipped sizes
3. Compare against budgets
4. Report violations
5. Exit with error code if budgets are exceeded

### Full Validation

Build and validate in one command:

```bash
pnpm run perf:validate
```

This runs:
1. Production build
2. Bundle size validation

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Build
  run: pnpm run build

- name: Validate Performance Budgets
  run: pnpm run perf:check-bundles
```

## Bundle Analysis

Generate a visual bundle analysis report:

```bash
pnpm run analyze
```

This creates `dist/stats.html` with an interactive treemap showing:
- Bundle composition
- Module sizes
- Dependencies
- Gzipped sizes

## Monitoring in Production

### Performance Metrics Endpoint

The application exposes performance metrics at `/api/metrics`:

```bash
curl https://your-app.com/api/metrics
```

Response includes:
- Core Web Vitals
- Route load times
- Bundle metrics
- Statistics

### Browser DevTools

Monitor Core Web Vitals in Chrome DevTools:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run performance audit
4. Check Core Web Vitals section

## Optimization Tips

### Reduce Bundle Size

1. **Analyze the bundle:**
   ```bash
   pnpm run analyze
   ```

2. **Check for duplicate dependencies:**
   - Review the bundle visualization
   - Look for multiple versions of the same package

3. **Lazy load components:**
   - Use `React.lazy()` for route components
   - Wrap with `Suspense` boundaries

4. **Optimize imports:**
   - Import specific components instead of entire libraries
   - Use tree-shakeable libraries

5. **Remove unused code:**
   - Run `pnpm why <package>` to find unused dependencies
   - Remove unused imports and code

### Improve Core Web Vitals

#### LCP (Largest Contentful Paint)
- Preload critical resources
- Optimize images (use WebP/AVIF)
- Minimize render-blocking resources
- Use CDN for static assets

#### FID/INP (Interactivity)
- Break up long tasks
- Optimize JavaScript execution
- Use web workers for heavy computations
- Defer non-critical JavaScript

#### CLS (Layout Shift)
- Set explicit dimensions for images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS transforms for animations

#### TTFB (Server Response)
- Use CDN
- Optimize server response time
- Enable HTTP/2 or HTTP/3
- Implement caching strategies

## Budget Status Indicators

The validation scripts use emoji indicators:

- ✅ **PASS** - Within budget (≤ 80% of limit)
- ⚠️ **WARNING** - Near budget (80-100% of limit)
- ❌ **FAIL** - Exceeds budget (> 100% of limit)

## Updating Budgets

To update performance budgets, edit:

```
apps/user-application/src/config/performance-budgets.ts
```

Consider updating budgets when:
- Adding major new features
- Upgrading dependencies
- Changing architecture
- Based on real-world metrics

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
