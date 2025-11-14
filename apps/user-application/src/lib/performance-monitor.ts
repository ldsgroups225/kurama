/**
 * Performance monitoring utilities for tracking Core Web Vitals and bundle metrics
 * Implements requirements 6.1, 6.2, 6.3 from bundle-optimization spec
 */

export interface CoreWebVitals {
  LCP: number // Largest Contentful Paint
  FID: number // First Input Delay (deprecated, using INP)
  INP: number // Interaction to Next Paint (replaces FID)
  CLS: number // Cumulative Layout Shift
  TTFB: number // Time to First Byte
}

export interface BundleMetrics {
  routeName: string
  chunkSize: number
  loadTime: number
  timeToInteractive: number
  timestamp: number
}

export interface RouteLoadMetrics {
  routeName: string
  loadTime: number
  timestamp: number
}

export interface MetricStats {
  avg: number
  min: number
  max: number
  p95: number
  count: number
}

/**
 * PerformanceMonitor class for tracking and aggregating performance metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private bundleMetrics: BundleMetrics[] = []
  private routeMetrics: RouteLoadMetrics[] = []
  private webVitals: Partial<CoreWebVitals> = {}

  /**
   * Record a generic metric value
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  /**
   * Record bundle metrics for a specific route
   */
  recordBundleMetrics(metrics: BundleMetrics): void {
    this.bundleMetrics.push(metrics)
    this.recordMetric(`bundle.${metrics.routeName}.size`, metrics.chunkSize)
    this.recordMetric(`bundle.${metrics.routeName}.loadTime`, metrics.loadTime)
    this.recordMetric(`bundle.${metrics.routeName}.tti`, metrics.timeToInteractive)
  }

  /**
   * Record route load time
   */
  recordRouteLoad(routeName: string, loadTime: number): void {
    const metric: RouteLoadMetrics = {
      routeName,
      loadTime,
      timestamp: Date.now(),
    }
    this.routeMetrics.push(metric)
    this.recordMetric(`route.${routeName}.loadTime`, loadTime)
  }

  /**
   * Record Core Web Vitals metric
   */
  recordWebVital(name: keyof CoreWebVitals, value: number): void {
    this.webVitals[name] = value
    this.recordMetric(`webvitals.${name}`, value)
  }

  /**
   * Get statistics for a specific metric
   */
  getStats(name: string): MetricStats | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      p95: this.percentile(sorted, 0.95),
      count: values.length,
    }
  }

  /**
   * Get all bundle metrics
   */
  getBundleMetrics(): BundleMetrics[] {
    return [...this.bundleMetrics]
  }

  /**
   * Get all route load metrics
   */
  getRouteMetrics(): RouteLoadMetrics[] {
    return [...this.routeMetrics]
  }

  /**
   * Get current Core Web Vitals
   */
  getWebVitals(): Partial<CoreWebVitals> {
    return { ...this.webVitals }
  }

  /**
   * Get all metrics as a summary object
   */
  getAllMetrics(): {
    webVitals: Partial<CoreWebVitals>
    bundleMetrics: BundleMetrics[]
    routeMetrics: RouteLoadMetrics[]
    stats: Record<string, MetricStats>
  } {
    const stats: Record<string, MetricStats> = {}
    for (const [name] of this.metrics) {
      const metricStats = this.getStats(name)
      if (metricStats) {
        stats[name] = metricStats
      }
    }

    return {
      webVitals: this.getWebVitals(),
      bundleMetrics: this.getBundleMetrics(),
      routeMetrics: this.getRouteMetrics(),
      stats,
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
    this.bundleMetrics = []
    this.routeMetrics = []
    this.webVitals = {}
  }

  /**
   * Calculate percentile value from sorted array
   */
  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0
    const index = Math.floor(sortedValues.length * p)
    return sortedValues[Math.min(index, sortedValues.length - 1)] ?? 0
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Track Core Web Vitals using the web-vitals library pattern
 * This uses the Performance Observer API to track real user metrics
 */
export function trackCoreWebVitals(): void {
  if (typeof window === 'undefined') return

  // Track LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number
        loadTime?: number
      }
      const lcp = lastEntry.renderTime || lastEntry.loadTime || 0
      perfMonitor.recordWebVital('LCP', lcp)
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) {
    console.warn('LCP tracking not supported', e)
  }

  // Track CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value || 0
          perfMonitor.recordWebVital('CLS', clsValue)
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch (e) {
    console.warn('CLS tracking not supported', e)
  }

  // Track INP (Interaction to Next Paint) - replaces FID
  try {
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        const interactionEntry = entry as PerformanceEntry & { duration?: number }
        const inp = interactionEntry.duration || 0
        perfMonitor.recordWebVital('INP', inp)
        // Also record as FID for backwards compatibility
        perfMonitor.recordWebVital('FID', inp)
      }
    })
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
  } catch (e) {
    // Fallback to first-input for older browsers
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstInput = entries[0] as PerformanceEntry & { processingStart?: number; startTime?: number }
        const fid = firstInput.processingStart ? firstInput.processingStart - firstInput.startTime : 0
        perfMonitor.recordWebVital('FID', fid)
        perfMonitor.recordWebVital('INP', fid)
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
    } catch (e2) {
      console.warn('INP/FID tracking not supported', e2)
    }
  }

  // Track TTFB (Time to First Byte)
  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      perfMonitor.recordWebVital('TTFB', ttfb)
    }
  } catch (e) {
    console.warn('TTFB tracking not supported', e)
  }
}

/**
 * Track route load time
 */
export function trackRouteLoad(routeName: string): () => void {
  const startTime = performance.now()

  return () => {
    const loadTime = performance.now() - startTime
    perfMonitor.recordRouteLoad(routeName, loadTime)

    if (import.meta.env.DEV) {
      console.log(`[Performance] Route "${routeName}" loaded in ${loadTime.toFixed(2)}ms`)
    }
  }
}

/**
 * Track bundle chunk load
 */
export function trackBundleLoad(routeName: string, chunkSize?: number): () => void {
  const startTime = performance.now()

  return () => {
    const loadTime = performance.now() - startTime
    const timeToInteractive = performance.now()

    const metrics: BundleMetrics = {
      routeName,
      chunkSize: chunkSize || 0,
      loadTime,
      timeToInteractive,
      timestamp: Date.now(),
    }

    perfMonitor.recordBundleMetrics(metrics)

    if (import.meta.env.DEV) {
      console.log(`[Performance] Bundle "${routeName}" loaded in ${loadTime.toFixed(2)}ms`)
    }
  }
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(): void {
  if (import.meta.env.DEV) {
    const metrics = perfMonitor.getAllMetrics()
    console.group('📊 Performance Metrics')
    console.log('Core Web Vitals:', metrics.webVitals)
    console.log('Route Metrics:', metrics.routeMetrics)
    console.log('Bundle Metrics:', metrics.bundleMetrics)
    console.log('Statistics:', metrics.stats)
    console.groupEnd()
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return

  // Track Core Web Vitals
  trackCoreWebVitals()

  // Log metrics on page unload (development only)
  if (import.meta.env.DEV) {
    window.addEventListener('beforeunload', () => {
      logPerformanceMetrics()
    })
  }
}
