import type { QueueStatus } from '@/lib/mutation-queue'
import { AlertCircle, CloudUpload, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getMutationQueueManager } from '@/lib/mutation-queue'

/**
 * Sync Status Component
 * Shows the status of pending mutations and allows manual sync
 */
export function SyncStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const updateStatus = async () => {
      const queueManager = getMutationQueueManager()
      const newStatus = await queueManager.getQueueStatus()
      setStatus(newStatus)
    }

    updateStatus()

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRetryAll = async () => {
    setIsSyncing(true)
    try {
      const queueManager = getMutationQueueManager()
      await queueManager.processQueue()
    }
    catch (error) {
      console.error('Failed to process queue:', error)
    }
    finally {
      setIsSyncing(false)
    }
  }

  // Don't show if no pending operations
  if (!status || (status.pending === 0 && status.processing === 0 && status.failed === 0)) {
    return null
  }

  const totalPending = status.pending + status.processing

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2"
        >
          <CloudUpload className="h-4 w-4" />
          {totalPending > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1">
              {totalPending}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>État de synchronisation</SheetTitle>
          <SheetDescription>
            Gestion des opérations en attente de synchronisation
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Status cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{status.pending}</div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{status.processing}</div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-success">{status.completed}</div>
              <div className="text-xs text-muted-foreground">Terminées</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-error">{status.failed}</div>
              <div className="text-xs text-muted-foreground">Échouées</div>
            </div>
          </div>

          {/* Conflicts warning */}
          {status.conflicts > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>
                {status.conflicts}
                {' '}
                conflit
                {status.conflicts > 1 ? 's' : ''}
                {' '}
                détecté
                {status.conflicts > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Actions */}
          {(status.failed > 0 || status.pending > 0) && (
            <Button
              onClick={handleRetryAll}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Synchronisation...
                    </>
                  )
                : (
                    <>
                      <CloudUpload className="mr-2 h-4 w-4" />
                      Réessayer tout
                    </>
                  )}
            </Button>
          )}

          {/* Info */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Les opérations seront automatiquement synchronisées lorsque vous serez en ligne.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
