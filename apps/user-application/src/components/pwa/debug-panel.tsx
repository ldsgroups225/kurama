import type { PWAMetrics } from '@/lib/pwa-monitoring'
import { Activity, AlertCircle, CheckCircle, Clock, Database, HardDrive, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { getPWAMonitoring } from '@/lib/pwa-monitoring'

/**
 * PWA Debug Panel Component
 *
 * Displays PWA metrics, cache status, sync history, and error logs
 * Only visible in development mode
 */
export function DebugPanel() {
  const [metrics, setMetrics] = useState<PWAMetrics | null>(null)
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    conflicts: 0,
  })
  const [storageInfo, setStorageInfo] = useState({
    quota: 0,
    usage: 0,
    available: 0,
  })
  const [cacheFailureRate, setCacheFailureRate] = useState(0)
  const [syncSuccessRate, setSyncSuccessRate] = useState(100)
  const [avgSyncDuration, setAvgSyncDuration] = useState(0)

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = async () => {
      const monitoring = getPWAMonitoring()
      const queueManager = getMutationQueueManager()

      // Get PWA metrics
      setMetrics(monitoring.getMetrics())
      setCacheFailureRate(monitoring.getCacheFailureRate())
      setSyncSuccessRate(monitoring.getSyncSuccessRate())
      setAvgSyncDuration(monitoring.getAverageSyncDuration())

      // Get queue status
      const status = await queueManager.getQueueStatus()
      setQueueStatus(status)

      // Get storage info
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        setStorageInfo({
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000)
      return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const exportMetrics = () => {
    const monitoring = getPWAMonitoring()
    const json = monitoring.exportMetrics()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pwa-metrics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearMetrics = () => {
    const monitoring = getPWAMonitoring()
    monitoring.clearMetrics()
    setMetrics(monitoring.getMetrics())
  }

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          title="PWA Debug Panel"
        >
          <Activity className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>PWA Debug Panel</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quota:</span>
                <span className="font-medium">{formatBytes(storageInfo.quota)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usage:</span>
                <span className="font-medium">{formatBytes(storageInfo.usage)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-medium">{formatBytes(storageInfo.available)}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${storageInfo.quota > 0 ? (storageInfo.usage / storageInfo.quota) * 100 : 0}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Mutation Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{queueStatus.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{queueStatus.processing}</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-success">{queueStatus.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-error">{queueStatus.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Sync Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate:</span>
                <div className="flex items-center gap-2">
                  {syncSuccessRate >= 80
                    ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )
                    : (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                  <span className="font-medium">
                    {syncSuccessRate.toFixed(1)}
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Duration:</span>
                <span className="font-medium">{formatDuration(avgSyncDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache Failure Rate:</span>
                <div className="flex items-center gap-2">
                  {cacheFailureRate > 5
                    ? (
                        <XCircle className="h-4 w-4 text-error" />
                      )
                    : (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                  <span className="font-medium">
                    {cacheFailureRate.toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          {metrics && metrics.serviceWorkerErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4" />
                  Recent Errors (
                  {metrics.serviceWorkerErrors.length}
                  )
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.serviceWorkerErrors.slice(-5).reverse().map(error => (
                    <div key={`${error.timestamp}-${error.message}`} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium text-error">{error.message}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={exportMetrics} variant="outline" className="flex-1">
              Export Metrics
            </Button>
            <Button onClick={clearMetrics} variant="outline" className="flex-1">
              Clear Metrics
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
