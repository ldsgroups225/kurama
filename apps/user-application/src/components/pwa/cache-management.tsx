import { AlertCircle, Database, HardDrive, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useOfflineContent } from '@/hooks/use-offline-content'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'

interface StorageInfo {
  usage: number
  quota: number
  usagePercent: number
  usageFormatted: string
  quotaFormatted: string
}

export function CacheManagement() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showClearOldDialog, setShowClearOldDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showUnpinDialog, setShowUnpinDialog] = useState(false)
  const [contentToUnpin, setContentToUnpin] = useState<string | null>(null)

  const { pinnedContent, removeOfflineContent } = useOfflineContent()
  const { toast } = useToast()

  // Format bytes to human-readable format
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }, [])

  // Load storage information
  const loadStorageInfo = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const usagePercent = quota > 0 ? (usage / quota) * 100 : 0

        setStorageInfo({
          usage,
          quota,
          usagePercent,
          usageFormatted: formatBytes(usage),
          quotaFormatted: formatBytes(quota),
        })
      }
      else {
        // Fallback for browsers that don't support storage.estimate()
        setStorageInfo({
          usage: 0,
          quota: 0,
          usagePercent: 0,
          usageFormatted: 'N/A',
          quotaFormatted: 'N/A',
        })
      }
    }
    catch (error) {
      console.error('Failed to estimate storage:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [formatBytes])

  useEffect(() => {
    loadStorageInfo()
  }, [loadStorageInfo])

  // Clear all cache
  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      // Clear query cache (except pinned content)
      const allEntries = await db.queryCache.toArray()
      const unpinnedEntries = allEntries.filter(entry => !entry.pinned)

      for (const entry of unpinnedEntries) {
        await db.queryCache.delete(entry.key)
      }

      // Clear completed mutations
      await db.mutationQueue
        .where('status')
        .equals('completed')
        .delete()

      // Clear browser caches (except offline-content cache for pinned items)
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        if (cacheName !== 'offline-content') {
          await caches.delete(cacheName)
        }
      }

      // Reload storage info
      await loadStorageInfo()

      setShowClearDialog(false)
      console.warn('Cache cleared successfully')
    }
    catch (error) {
      console.error('Failed to clear cache:', error)
      console.error('Failed to clear cache')
    }
    finally {
      setIsClearing(false)
    }
  }

  // Clear old/stale data
  const handleClearOldData = async () => {
    setIsClearing(true)
    try {
      const now = Date.now()
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

      // Remove stale query cache entries (older than 7 days and not pinned)
      const staleEntries = await db.queryCache
        .where('timestamp')
        .below(sevenDaysAgo)
        .and(entry => !entry.pinned)
        .toArray()

      for (const entry of staleEntries) {
        await db.queryCache.delete(entry.key)
      }

      // Remove old completed mutations (older than 24 hours)
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      await db.mutationQueue
        .where('status')
        .equals('completed')
        .and(mutation => mutation.createdAt < oneDayAgo)
        .delete()

      // Reload storage info
      await loadStorageInfo()

      setShowClearOldDialog(false)
      toast({
        title: 'Succès',
        description: `${staleEntries.length} entrées obsolètes supprimées!`,
      })
    }
    catch (error) {
      console.error('Failed to clear old data:', error)
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression des données obsolètes',
        variant: 'destructive',
      })
    }
    finally {
      setIsClearing(false)
    }
  }

  // Unpin content
  const handleUnpin = (contentId: string) => {
    setContentToUnpin(contentId)
    setShowUnpinDialog(true)
  }

  const confirmUnpin = async () => {
    if (!contentToUnpin)
      return

    try {
      await removeOfflineContent(contentToUnpin)
      await loadStorageInfo()
      setShowUnpinDialog(false)
      setContentToUnpin(null)
      console.warn('Content unpinned successfully')
    }
    catch (error) {
      console.error('Failed to unpin content:', error)
      toast({
        title: 'Erreur',
        description: 'Échec du retrait du contenu',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion du cache</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion du cache
          </CardTitle>
          <CardDescription>
            Gérez l'espace de stockage utilisé par l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Espace utilisé</span>
              <span className="font-medium">
                {storageInfo?.usageFormatted}
                {' '}
                /
                {storageInfo?.quotaFormatted}
              </span>
            </div>
            <Progress
              value={storageInfo?.usagePercent || 0}
              className={cn(
                'h-3',
                storageInfo && storageInfo.usagePercent > 80 && 'bg-error/20',
              )}
            />
            <p className="text-xs text-muted-foreground">
              {storageInfo?.usagePercent.toFixed(1)}
              % de l'espace disponible utilisé
            </p>
            {storageInfo && storageInfo.usagePercent > 80 && (
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  L'espace de stockage est presque plein. Envisagez de supprimer les anciennes
                  données.
                </p>
              </div>
            )}
          </div>

          {/* Cache Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Actions</h3>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearOldDialog(true)}
                disabled={isClearing}
                className="justify-start"
              >
                <HardDrive className="mr-2 h-4 w-4" />
                Supprimer les données obsolètes
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                disabled={isClearing}
                className="justify-start text-error hover:text-error"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Effacer tout le cache
              </Button>
            </div>
          </div>

          {/* Pinned Content */}
          {pinnedContent.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                Contenu hors ligne (
                {pinnedContent.length}
                )
              </h3>
              <div className="space-y-2">
                {pinnedContent.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(item.size)}
                        {' '}
                        • Téléchargé le
                        {' '}
                        {new Date(item.downloadedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnpin(item.id)}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Cache Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effacer tout le cache ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera toutes les données en cache sauf le contenu épinglé et les
              mutations en attente. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              disabled={isClearing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCache}
              disabled={isClearing}
            >
              {isClearing ? 'Effacement...' : 'Effacer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Old Data Dialog */}
      <Dialog open={showClearOldDialog} onOpenChange={setShowClearOldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer les données obsolètes ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera les données en cache de plus de 7 jours et les mutations
              terminées de plus de 24 heures. Le contenu épinglé sera préservé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearOldDialog(false)}
              disabled={isClearing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleClearOldData}
              disabled={isClearing}
            >
              {isClearing ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpin Content Dialog */}
      <Dialog open={showUnpinDialog} onOpenChange={setShowUnpinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer des favoris hors ligne ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer ce contenu des favoris hors ligne ? Le contenu sera
              supprimé du cache local et ne sera plus disponible sans connexion internet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnpinDialog(false)
                setContentToUnpin(null)
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnpin}
            >
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
