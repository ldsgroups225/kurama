# Bundle Analysis and Performance Monitoring

This document describes the bundle analysis and performance monitoring infrastructure for the Kurama frontend application.

## Bundle Analysis

### Available Scripts

```bash
# Build and generate bundle analysis report
pnpm run analyze

# Build with analysis (alternative)
pnpm run build:analyze

# Regular production build (also generates stats.html)
pnpm run build
```

### Viewing Bundle Analysis

After running any of the above commands, a bundle visualization report will be generated at:
```
dist/stats.html
```

The report includes:
- **Treemap visualization** of bundle composition
- **Gzip and Brotli sizes** for all chunks
- **Detailed breakdown** of dependencies and their sizes
- **Interactive exploration** of what's included in each chunk

### Bundle Structure

The build is configured to split code into the following chunks:

1. **vendor-react**: React and React DOM
2. **vendor-tanstack**: TanStack Router, Query, and Start
3. **vendor-radix**: All Radix UI components
4. **vendor-ui**: UI utilities (lucide-react, clsx, tailwind-merge, etc.)
5. **Route chunks**: Automatically split by TanStack Router

### Bundle Budgets

Performance budgets are defined in `src/config/performance-budgets.ts`:

- **Main bundle**: < 150 kB (< 50 kB gzipped)
- **Vendor chunks**: 100-200 kB each
- **Route chunks**: < 60 kB each
- **Total initial load**: < 250 kB gzipped

## Performance Monitoring

### Core Web Vitals Tracking

The application tracks the following Core Web Vitals:

- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **TTFB (Time to First Byte)**: Target < 800ms

### Using the Performance Monitor

```typescript
import { perfMonitor, initPerformanceMonitoring } from '@/lib/performance-monitor';

// Initialize monitoring (call once on app start)
initPerformanceMonitoring();

// Measure route load time
const endMeasure = perfMonitor.measureRouteLoad('/app/dashboard');
// ... route loads ...
endMeasure();

// Track bundle metrics
perfMonitor.trackBundleMetrics({
  routeName: '/app/dashboard',
  chunkSize: 65536, // bytes
  loadTime: 150, // ms
  timeToInteractive: 500, // ms
  timestamp: Date.now(),
});

// Get statistics for a metric
const stats = perfMonitor.getStats('route:/app/dashboard:load');
console.log(stats); // { avg, min, max, p95, count }

// Check Core Web Vitals against budget
const vitals = await perfMonitor.trackCoreWebVitals();
if (vitals) {
  const budgetCheck = perfMonitor.checkBudget(vitals);
  if (!budgetCheck.passed) {
    console.warn('Budget violations:', budgetCheck.violations);
  }
}
```

### Performance Budget Utilities

```typescript
import {
  checkBundleBudget,
  checkRouteBudget,
  checkMetricBudget,
} from '@/config/performance-budgets';

// Check bundle size
const bundleCheck = checkBundleBudget('main', 153600, 51200);
if (!bundleCheck.passed) {
  console.warn(bundleCheck.violations);
}

// Check route performance
const routeCheck = checkRouteBudget('/app/dashboard', 65536, 2100);
if (!routeCheck.passed) {
  console.warn(routeCheck.violations);
}

// Check individual metric
const metricCheck = checkMetricBudget('LCP', 2800);
if (!metricCheck.passed) {
  console.warn(metricCheck.violation);
}
```

## Vite Configuration

The Vite configuration includes:

### Bundle Visualization
- **rollup-plugin-visualizer**: Generates interactive bundle analysis
- **Output**: `dist/stats.html`
- **Formats**: Treemap with gzip and brotli sizes

### Build Optimization
- **Manual chunks**: Vendor splitting for better caching
- **Chunk size warning**: 500 kB threshold
- **Compressed size reporting**: Enabled
- **Dependency pre-bundling**: Critical dependencies included

### Configuration Location
All bundle optimization settings are in `vite.config.ts`.

## Development Workflow

1. **Make changes** to the application
2. **Run analysis**: `pnpm run analyze`
3. **Review report**: Open `dist/stats.html`
4. **Check budgets**: Review console output for violations
5. **Optimize**: Address any budget violations
6. **Repeat**: Iterate until budgets are met

## Monitoring in Production

The performance monitor automatically tracks metrics in development mode. To enable in production:

1. Initialize monitoring in your app entry point:
```typescript
import { initPerformanceMonitoring } from '@/lib/performance-monitor';

// In your app initialization
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}
```

2. Metrics will be logged to the console in development
3. In production, metrics are collected but not logged (can be sent to analytics)

## Next Steps

After setting up bundle analysis:

1. **Implement route-based code splitting** (Task 2)
2. **Add component lazy loading** (Task 3)
3. **Optimize third-party dependencies** (Task 5)
4. **Monitor and iterate** based on analysis results

## Resources

- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [TanStack Router Code Splitting](https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting)
