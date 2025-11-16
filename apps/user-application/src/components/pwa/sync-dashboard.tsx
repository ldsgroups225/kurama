import type { MutationQueueEntry } from '@/lib/db'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CloudUpload,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { db } from '@/lib/db'
import { getMutationQueueManager } from '@/lib/mutation-queue'

/**
 * Sync Status Dashboard Component
 *
 * Displays detailed sync status with:
 * - Pending, processing, completed, and failed mutation counts
 * - Detailed list of queued mutations with timestamps
 * - Retry all button for failed mutations
 * - Last successful sync time per data type
 * - Sync errors with details and manual retry option
 */
export function SyncDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    conflicts: 0,
  })
  const [mutations, setMutations] = useState<MutationQueueEntry[]>([])
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, number>>({})
  const [isRetrying, setIsRetrying] = useState(false)

  // Update status periodically
  useEffect(() => {
    if (!isOpen)
      return

    const updateStatus = async () => {
      const queueManager = getMutationQueueManager()

      // Get queue status
      const status = await queueManager.getQueueStatus()
      setQueueStatus(status)

      // Get all mutations
      const allMutations = await db.mutationQueue.toArray()
      setMutations(allMutations.sort((a, b) => b.createdAt - a.createdAt))

      // Calculate last sync times per endpoint
      const syncTimes: Record<string, number> = {}
      const completedMutations = allMutations.filter(m => m.status === 'completed')

      for (const mutation of completedMutations) {
        const endpoint = mutation.endpoint
        if (!syncTimes[endpoint] || mutation.createdAt > syncTimes[endpoint]) {
          syncTimes[endpoint] = mutation.createdAt
        }
      }

      setLastSyncTimes(syncTimes)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 3000)

    return () => clearInterval(interval)
  }, [isOpen])

  const handleRetryAll = async () => {
    setIsRetrying(true)

    try {
      const queueManager = getMutationQueueManager()

      // Get all failed mutations
      const failedMutations = mutations.filter(m => m.status === 'failed')

      // Reset each failed mutation to pending
      for (const mutation of failedMutations) {
        await db.mutationQueue.update(mutation.id, {
          status: 'pending',
          retryCount: 0,
          error: undefined,
        })
      }

      // Trigger queue processing
      await queueManager.processQueue()
    }
    catch (error) {
      console.error('Failed to retry mutations:', error)
    }
    finally {
      setIsRetrying(false)
    }
  }

  const handleRetryOne = async (mutationId: string) => {
    try {
      const queueManager = getMutationQueueManager()

      // Reset mutation to pending
      await db.mutationQueue.update(mutationId, {
        status: 'pending',
        retryCount: 0,
        error: undefined,
      })

      // Process this specific mutation
      await queueManager.processMutation(mutationId)
    }
    catch (error) {
      console.error('Failed to retry mutation:', error)
    }
  }

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return 'À l\'instant'
    }
    if (diff < 3600000) {
      return `Il y a ${Math.floor(diff / 60000)} min`
    }
    if (diff < 86400000) {
      return `Il y a ${Math.floor(diff / 3600000)} h`
    }
    return new Date(timestamp).toLocaleDateString('fr-FR')
  }

  const getStatusIcon = (status: MutationQueueEntry['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-info" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-error" />
      case 'conflict':
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: MutationQueueEntry['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'processing':
        return 'En cours'
      case 'completed':
        return 'Terminé'
      case 'failed':
        return 'Échoué'
      case 'conflict':
        return 'Conflit'
      default:
        return status
    }
  }

  const getMutationTypeLabel = (type: MutationQueueEntry['type']) => {
    switch (type) {
      case 'create':
        return 'Création'
      case 'update':
        return 'Mise à jour'
      case 'delete':
        return 'Suppression'
      default:
        return type
    }
  }

  const totalMutations = queueStatus.pending + queueStatus.processing + queueStatus.failed

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
        >
          <CloudUpload className="mr-2 h-4 w-4" />
          Synchronisation
          {totalMutations > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalMutations}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Tableau de bord de synchronisation</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{queueStatus.pending}</div>
                    <div className="text-xs text-muted-foreground">En attente</div>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{queueStatus.processing}</div>
                    <div className="text-xs text-muted-foreground">En cours</div>
                  </div>
                  <Loader2 className="h-8 w-8 animate-spin text-info" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-success">{queueStatus.completed}</div>
                    <div className="text-xs text-muted-foreground">Terminés</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-error">{queueStatus.failed}</div>
                    <div className="text-xs text-muted-foreground">Échoués</div>
                  </div>
                  <XCircle className="h-8 w-8 text-error" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retry All Button */}
          {queueStatus.failed > 0 && (
            <Button
              onClick={handleRetryAll}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réessai en cours...
                    </>
                  )
                : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Réessayer tout (
                      {queueStatus.failed}
                      )
                    </>
                  )}
            </Button>
          )}

          {/* Last Sync Times */}
          {Object.keys(lastSyncTimes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dernières synchronisations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(lastSyncTimes).map(([endpoint, timestamp]) => (
                  <div key={endpoint} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {endpoint.split('/').pop() || endpoint}
                    </span>
                    <span className="font-medium">{formatTimestamp(timestamp)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Mutations List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Opérations en file (
                {mutations.length}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mutations.length === 0
                ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Aucune opération en attente
                    </div>
                  )
                : (
                    <div className="space-y-3">
                      {mutations.slice(0, 20).map(mutation => (
                        <div
                          key={mutation.id}
                          className="rounded-lg border p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(mutation.status)}
                              <div>
                                <div className="text-sm font-medium">
                                  {getMutationTypeLabel(mutation.type)}
                                  {' '}
                                  -
                                  {' '}
                                  {mutation.endpoint.split('/').pop() || mutation.endpoint}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getStatusLabel(mutation.status)}
                                  {' '}
                                  •
                                  {' '}
                                  {formatTimestamp(mutation.createdAt)}
                                </div>
                              </div>
                            </div>

                            {mutation.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRetryOne(mutation.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {mutation.error && (
                            <div className="rounded bg-error/10 px-2 py-1 text-xs text-error">
                              {mutation.error}
                            </div>
                          )}

                          {mutation.retryCount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Tentatives:
                              {' '}
                              {mutation.retryCount}
                              {' '}
                              / 5
                            </div>
                          )}
                        </div>
                      ))}

                      {mutations.length > 20 && (
                        <div className="py-2 text-center text-xs text-muted-foreground">
                          ... et
                          {' '}
                          {mutations.length - 20}
                          {' '}
                          autres opérations
                        </div>
                      )}
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
