/**
 * PWA Monitoring and Error Tracking
 *
 * Tracks PWA-specific metrics and errors for debugging and optimization
 */

import { createLogger } from '@kurama/observability/logging'
import { captureException, captureMessage } from '@kurama/observability/sentry/browser'

const logger = createLogger('pwa')

export interface PWAMetrics {
  /** Service worker errors */
  serviceWorkerErrors: ErrorLog[]
  /** Cache operation failures */
  cacheFailures: CacheFailureLog[]
  /** Sync operations */
  syncOperations: SyncLog[]
  /** Storage quota events */
  quotaEvents: QuotaLog[]
}

export interface ErrorLog {
  timestamp: number
  type: 'service-worker' | 'cache' | 'sync' | 'storage'
  message: string
  stack?: string
  context?: Record<string, any>
}

export interface CacheFailureLog {
  timestamp: number
  operation: 'read' | 'write' | 'delete'
  cacheName: string
  url?: string
  error: string
}

export interface SyncLog {
  timestamp: number
  operation: 'start' | 'success' | 'failure'
  duration?: number
  mutationCount?: number
  error?: string
}

export interface QuotaLog {
  timestamp: number
  quota: number
  usage: number
  available: number
  exceeded: boolean
}

/**
 * PWA Monitoring Manager
 */
class PWAMonitoringManager {
  private metrics: PWAMetrics = {
    serviceWorkerErrors: [],
    cacheFailures: [],
    syncOperations: [],
    quotaEvents: [],
  }

  private maxLogsPerType = 50 // Keep last 50 logs per type

  /**
   * Log service worker error
   */
  logServiceWorkerError(error: Error, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: Date.now(),
      type: 'service-worker',
      message: error.message,
      stack: error.stack,
      context,
    }

    this.metrics.serviceWorkerErrors.push(log)
    this.trimLogs('serviceWorkerErrors')

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[PWA Monitoring] Service Worker Error:', error, context)
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(log)
    }
  }

  /**
   * Log cache operation failure
   */
  logCacheFailure(
    operation: 'read' | 'write' | 'delete',
    cacheName: string,
    error: Error,
    url?: string,
  ): void {
    const log: CacheFailureLog = {
      timestamp: Date.now(),
      operation,
      cacheName,
      url,
      error: error.message,
    }

    this.metrics.cacheFailures.push(log)
    this.trimLogs('cacheFailures')

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[PWA Monitoring] Cache Failure:', log)
    }

    // Check failure rate
    this.checkCacheFailureRate()
  }

  /**
   * Log sync operation
   */
  logSyncOperation(
    operation: 'start' | 'success' | 'failure',
    duration?: number,
    mutationCount?: number,
    error?: Error,
  ): void {
    const log: SyncLog = {
      timestamp: Date.now(),
      operation,
      duration,
      mutationCount,
      error: error?.message,
    }

    this.metrics.syncOperations.push(log)
    this.trimLogs('syncOperations')

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('[PWA Monitoring] Sync Operation:', log)
    }

    // Calculate sync success rate
    if (operation === 'success' || operation === 'failure') {
      this.calculateSyncSuccessRate()
    }
  }

  /**
   * Log storage quota event
   */
  async logQuotaEvent(exceeded: boolean = false): Promise<void> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return
    }

    try {
      const estimate = await navigator.storage.estimate()
      const quota = estimate.quota || 0
      const usage = estimate.usage || 0
      const available = quota - usage

      const log: QuotaLog = {
        timestamp: Date.now(),
        quota,
        usage,
        available,
        exceeded,
      }

      this.metrics.quotaEvents.push(log)
      this.trimLogs('quotaEvents')

      // Log to console in development
      if (import.meta.env.DEV) {
        console.warn('[PWA Monitoring] Quota Event:', log)
      }

      // Alert if quota exceeded
      if (exceeded) {
        console.warn('[PWA Monitoring] Storage quota exceeded!', log)
        this.sendToMonitoringService({
          timestamp: Date.now(),
          type: 'storage',
          message: 'Storage quota exceeded',
          context: log,
        })
      }
    }
    catch (error) {
      console.error('[PWA Monitoring] Failed to log quota event:', error)
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PWAMetrics {
    return { ...this.metrics }
  }

  /**
   * Get cache failure rate
   */
  getCacheFailureRate(): number {
    const recentFailures = this.metrics.cacheFailures.filter(
      log => Date.now() - log.timestamp < 60 * 60 * 1000, // Last hour
    )

    // Assume 100 operations per hour as baseline
    const totalOperations = 100
    return (recentFailures.length / totalOperations) * 100
  }

  /**
   * Get sync success rate
   */
  getSyncSuccessRate(): number {
    const recentSyncs = this.metrics.syncOperations.filter(
      log =>
        (log.operation === 'success' || log.operation === 'failure')
        && Date.now() - log.timestamp < 24 * 60 * 60 * 1000, // Last 24 hours
    )

    if (recentSyncs.length === 0) {
      return 100 // No syncs = 100% success
    }

    const successCount = recentSyncs.filter(log => log.operation === 'success').length
    return (successCount / recentSyncs.length) * 100
  }

  /**
   * Get average sync duration
   */
  getAverageSyncDuration(): number {
    const successfulSyncs = this.metrics.syncOperations.filter(
      log => log.operation === 'success' && log.duration !== undefined,
    )

    if (successfulSyncs.length === 0) {
      return 0
    }

    const totalDuration = successfulSyncs.reduce((sum, log) => sum + (log.duration || 0), 0)
    return totalDuration / successfulSyncs.length
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = {
      serviceWorkerErrors: [],
      cacheFailures: [],
      syncOperations: [],
      quotaEvents: [],
    }
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2)
  }

  /**
   * Trim logs to max size
   */
  private trimLogs(type: keyof PWAMetrics): void {
    const logs = this.metrics[type] as any[]
    if (logs.length > this.maxLogsPerType) {
      this.metrics[type] = logs.slice(-this.maxLogsPerType) as any
    }
  }

  /**
   * Check cache failure rate and alert if too high
   */
  private checkCacheFailureRate(): void {
    const failureRate = this.getCacheFailureRate()

    if (failureRate > 5) {
      // Alert if failure rate exceeds 5%
      console.warn(`[PWA Monitoring] Cache failure rate is high: ${failureRate.toFixed(2)}%`)

      this.sendToMonitoringService({
        timestamp: Date.now(),
        type: 'cache',
        message: `High cache failure rate: ${failureRate.toFixed(2)}%`,
        context: {
          failureRate,
          recentFailures: this.metrics.cacheFailures.slice(-10),
        },
      })
    }
  }

  /**
   * Calculate and log sync success rate
   */
  private calculateSyncSuccessRate(): void {
    const successRate = this.getSyncSuccessRate()

    if (import.meta.env.DEV) {
      console.warn(`[PWA Monitoring] Sync success rate: ${successRate.toFixed(2)}%`)
    }

    // Alert if success rate is low
    if (successRate < 80) {
      console.warn(`[PWA Monitoring] Sync success rate is low: ${successRate.toFixed(2)}%`)
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoringService(log: ErrorLog): void {
    // Send to Sentry
    if (log.type === 'service-worker' || log.type === 'cache') {
      captureException(new Error(log.message), {
        type: log.type,
        stack: log.stack,
        ...log.context,
      })
    }
    else {
      captureMessage(`[PWA] ${log.type}: ${log.message}`, 'warning')
    }

    // Also log via LogTape
    logger.error(log.message, { type: log.type, context: log.context })
  }
}

/**
 * Singleton instance
 */
let monitoringManager: PWAMonitoringManager | null = null

/**
 * Get monitoring manager instance
 */
export function getPWAMonitoring(): PWAMonitoringManager {
  if (!monitoringManager) {
    monitoringManager = new PWAMonitoringManager()
  }
  return monitoringManager
}

/**
 * Setup global error handlers for PWA
 */
export function setupPWAErrorHandlers(): void {
  // Service worker error handler
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('error', (event) => {
      getPWAMonitoring().logServiceWorkerError(
        new Error('Service Worker error'),
        { event: event.type },
      )
    })

    // Service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (import.meta.env.DEV) {
        console.warn('[PWA Monitoring] Service Worker controller changed')
      }
    })
  }

  // Window error handler
  window.addEventListener('error', (event) => {
    // Only log if it's related to service worker or cache
    if (
      event.message.includes('service worker')
      || event.message.includes('cache')
      || event.message.includes('IndexedDB')
    ) {
      getPWAMonitoring().logServiceWorkerError(
        new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      )
    }
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    // Only log if it's related to PWA features
    const reason = event.reason?.message || String(event.reason)
    if (
      reason.includes('service worker')
      || reason.includes('cache')
      || reason.includes('IndexedDB')
      || reason.includes('quota')
    ) {
      getPWAMonitoring().logServiceWorkerError(
        event.reason instanceof Error ? event.reason : new Error(reason),
        { type: 'unhandledrejection' },
      )
    }
  })

  // Storage quota exceeded handler
  window.addEventListener('storage', (event) => {
    if (event.key === 'quota_exceeded') {
      getPWAMonitoring().logQuotaEvent(true)
    }
  })

  if (import.meta.env.DEV) {
    console.warn('[PWA Monitoring] Error handlers setup complete')
  }
}

/**
 * Monitor storage quota periodically
 */
export function startQuotaMonitoring(intervalMs: number = 5 * 60 * 1000): () => void {
  const monitoring = getPWAMonitoring()

  // Initial check
  monitoring.logQuotaEvent()

  // Periodic checks
  const intervalId = window.setInterval(() => {
    monitoring.logQuotaEvent()
  }, intervalMs)

  // Return cleanup function
  return () => {
    window.clearInterval(intervalId)
  }
}
