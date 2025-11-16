import type { ConflictData } from '@/lib/mutation-queue'
import { AlertCircle, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getMutationQueueManager } from '@/lib/mutation-queue'

/**
 * Conflict Resolution Dialog
 * Displays conflicts and allows manual resolution
 */
export function ConflictResolutionDialog() {
  const [conflicts, setConflicts] = useState<ConflictData[]>([])
  const [currentConflict, setCurrentConflict] = useState<ConflictData | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  // Load conflicts on mount and periodically
  useEffect(() => {
    const loadConflicts = async () => {
      const queueManager = getMutationQueueManager()
      const conflictList = await queueManager.getConflicts()
      setConflicts(conflictList)

      // Show first conflict if available
      if (conflictList.length > 0 && !currentConflict) {
        setCurrentConflict(conflictList[0] || null)
      }
    }

    loadConflicts()

    // Check for conflicts every 10 seconds
    const interval = setInterval(loadConflicts, 10000)

    return () => clearInterval(interval)
  }, [currentConflict])

  const handleResolve = async (strategy: 'last-write-wins' | 'merge') => {
    if (!currentConflict)
      return

    setIsResolving(true)

    try {
      const queueManager = getMutationQueueManager()
      await queueManager.resolveConflict(currentConflict.mutationId, strategy)

      // Remove resolved conflict and show next
      const remaining = conflicts.filter(c => c.mutationId !== currentConflict.mutationId)
      setConflicts(remaining)
      setCurrentConflict(remaining.length > 0 ? (remaining[0] || null) : null)
    }
    catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
    finally {
      setIsResolving(false)
    }
  }

  const handleDismiss = () => {
    // Move to next conflict without resolving
    const remaining = conflicts.filter(c => c.mutationId !== currentConflict?.mutationId)
    setConflicts(remaining)
    setCurrentConflict(remaining.length > 0 ? (remaining[0] || null) : null)
  }

  if (!currentConflict) {
    return null
  }

  return (
    <Dialog open={!!currentConflict} onOpenChange={() => handleDismiss()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Conflit de données détecté
          </DialogTitle>
          <DialogDescription>
            Vos modifications locales sont en conflit avec les données du serveur.
            Choisissez comment résoudre ce conflit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict count */}
          {conflicts.length > 1 && (
            <div className="text-sm text-muted-foreground">
              Conflit
              {' '}
              {String(conflicts.indexOf(currentConflict) + 1)}
              {' '}
              sur
              {' '}
              {String(conflicts.length)}
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Vos modifications (locales)</h4>
            <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
              {String(JSON.stringify(currentConflict.localData, null, 2))}
            </pre>
          </div>

          {/* Server data */}
          {currentConflict.serverData && (
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Données du serveur</h4>
              <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                {String(JSON.stringify(currentConflict.serverData, null, 2))}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isResolving}
          >
            <X className="mr-2 h-4 w-4" />
            Ignorer
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleResolve('merge')}
            disabled={isResolving}
          >
            <Check className="mr-2 h-4 w-4" />
            Fusionner
          </Button>
          <Button
            onClick={() => handleResolve('last-write-wins')}
            disabled={isResolving}
          >
            <Check className="mr-2 h-4 w-4" />
            Utiliser mes modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
