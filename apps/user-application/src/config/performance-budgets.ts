/**
 * Performance budgets for bundle optimization
 * Implements requirements 4.4, 6.4 from bundle-optimization spec
 */

export interface BundleBudget {
  name: string
  maxSize: number // in bytes
  maxSizeGzip: number // in bytes
  description: string
}

export interface PerformanceBudget {
  // Core Web Vitals budgets (in milliseconds)
  maxLCP: number // Largest Contentful Paint
  maxFID: number // First Input Delay
  maxINP: number // Interaction to Next Paint
  maxCLS: number // Cumulative Layout Shift (unitless)
  maxTTFB: number // Time to First Byte

  // Bundle size budgets
  bundles: BundleBudget[]

  // Route load time budgets (in milliseconds)
  maxRouteLoadTime: number
  maxTimeToInteractive: number
}

/**
 * Performance budgets based on requirements
 */
export const performanceBudgets: PerformanceBudget = {
  // Core Web Vitals targets
  maxLCP: 2500, // 2.5s - Good threshold
  maxFID: 100, // 100ms - Good threshold
  maxINP: 200, // 200ms - Good threshold (replaces FID)
  maxCLS: 0.1, // 0.1 - Good threshold
  maxTTFB: 800, // 800ms - Good threshold

  // Bundle size budgets
  bundles: [
    {
      name: 'main',
      maxSize: 150 * 1024, // 150 KB
      maxSizeGzip: 150 * 1024, // 150 KB gzipped
      description: 'Main bundle containing core runtime and router',
    },
    {
      name: 'landing',
      maxSize: 60 * 1024, // 60 KB
      maxSizeGzip: 50 * 1024, // 50 KB gzipped
      description: 'Landing page route chunk',
    },
    {
      name: 'auth',
      maxSize: 40 * 1024, // 40 KB
      maxSizeGzip: 30 * 1024, // 30 KB gzipped
      description: 'Authentication components',
    },
    {
      name: 'onboarding',
      maxSize: 50 * 1024, // 50 KB
      maxSizeGzip: 40 * 1024, // 40 KB gzipped
      description: 'Onboarding flow',
    },
    {
      name: 'app-dashboard',
      maxSize: 70 * 1024, // 70 KB
      maxSizeGzip: 60 * 1024, // 60 KB gzipped
      description: 'Main app dashboard',
    },
    {
      name: 'profile',
      maxSize: 40 * 1024, // 40 KB
      maxSizeGzip: 30 * 1024, // 30 KB gzipped
      description: 'Profile page',
    },
    {
      name: 'lessons',
      maxSize: 50 * 1024, // 50 KB
      maxSizeGzip: 40 * 1024, // 40 KB gzipped
      description: 'Lessons page',
    },
    {
      name: 'groups',
      maxSize: 45 * 1024, // 45 KB
      maxSizeGzip: 35 * 1024, // 35 KB gzipped
      description: 'Groups page',
    },
    {
      name: 'progress',
      maxSize: 45 * 1024, // 45 KB
      maxSizeGzip: 35 * 1024, // 35 KB gzipped
      description: 'Progress tracking page',
    },
    {
      name: 'vendor-react',
      maxSize: 150 * 1024, // 150 KB
      maxSizeGzip: 50 * 1024, // 50 KB gzipped
      description: 'React and React DOM',
    },
    {
      name: 'vendor-tanstack',
      maxSize: 100 * 1024, // 100 KB
      maxSizeGzip: 35 * 1024, // 35 KB gzipped
      description: 'TanStack Router and Query',
    },
    {
      name: 'vendor-radix',
      maxSize: 120 * 1024, // 120 KB
      maxSizeGzip: 40 * 1024, // 40 KB gzipped
      description: 'Radix UI components',
    },
    {
      name: 'vendor-ui',
      maxSize: 50 * 1024, // 50 KB
      maxSizeGzip: 15 * 1024, // 15 KB gzipped
      description: 'UI utilities (lucide, clsx, tailwind-merge)',
    },
  ],

  // Route performance budgets
  maxRouteLoadTime: 3000, // 3s
  maxTimeToInteractive: 3000, // 3s
}

/**
 * Check if a bundle size is within budget
 */
export function isBundleWithinBudget(
  bundleName: string,
  actualSize: number,
  isGzipped: boolean = false
): { withinBudget: boolean; budget: BundleBudget | null; percentage: number } {
  const budget = performanceBudgets.bundles.find((b) =>
    bundleName.toLowerCase().includes(b.name.toLowerCase())
  )

  if (!budget) {
    return { withinBudget: true, budget: null, percentage: 0 }
  }

  const maxSize = isGzipped ? budget.maxSizeGzip : budget.maxSize
  const withinBudget = actualSize <= maxSize
  const percentage = (actualSize / maxSize) * 100

  return { withinBudget, budget, percentage }
}

/**
 * Check if Core Web Vitals are within budget
 */
export function areWebVitalsWithinBudget(metrics: {
  LCP?: number
  FID?: number
  INP?: number
  CLS?: number
  TTFB?: number
}): {
  withinBudget: boolean
  violations: string[]
} {
  const violations: string[] = []

  if (metrics.LCP && metrics.LCP > performanceBudgets.maxLCP) {
    violations.push(
      `LCP: ${metrics.LCP.toFixed(0)}ms exceeds budget of ${performanceBudgets.maxLCP}ms`
    )
  }

  if (metrics.FID && metrics.FID > performanceBudgets.maxFID) {
    violations.push(
      `FID: ${metrics.FID.toFixed(0)}ms exceeds budget of ${performanceBudgets.maxFID}ms`
    )
  }

  if (metrics.INP && metrics.INP > performanceBudgets.maxINP) {
    violations.push(
      `INP: ${metrics.INP.toFixed(0)}ms exceeds budget of ${performanceBudgets.maxINP}ms`
    )
  }

  if (metrics.CLS && metrics.CLS > performanceBudgets.maxCLS) {
    violations.push(
      `CLS: ${metrics.CLS.toFixed(3)} exceeds budget of ${performanceBudgets.maxCLS}`
    )
  }

  if (metrics.TTFB && metrics.TTFB > performanceBudgets.maxTTFB) {
    violations.push(
      `TTFB: ${metrics.TTFB.toFixed(0)}ms exceeds budget of ${performanceBudgets.maxTTFB}ms`
    )
  }

  return {
    withinBudget: violations.length === 0,
    violations,
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Get budget status color
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage <= 80) return 'green'
  if (percentage <= 100) return 'yellow'
  return 'red'
}

/**
 * Get budget status emoji
 */
export function getBudgetStatusEmoji(percentage: number): string {
  if (percentage <= 80) return '✅'
  if (percentage <= 100) return '⚠️'
  return '❌'
}
