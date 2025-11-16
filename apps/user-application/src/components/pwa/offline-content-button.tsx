import { Download, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useOfflineContent } from '@/hooks/use-offline-content'
import { cn } from '@/lib/utils'

interface OfflineContentButtonProps {
  contentId: string
  contentType: 'subject' | 'lesson' | 'flashcard'
  title: string
  fetchUrls: string[]
  className?: string
}

export function OfflineContentButton({
  contentId,
  contentType,
  title,
  fetchUrls,
  className,
}: OfflineContentButtonProps) {
  const {
    isContentOffline,
    downloadForOffline,
    removeOfflineContent,
    downloadProgress,
  } = useOfflineContent()

  const [isProcessing, setIsProcessing] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const isOffline = isContentOffline(contentId)
  const progress = downloadProgress.get(contentId)

  const handleDownload = async () => {
    setIsProcessing(true)
    try {
      await downloadForOffline(contentId, contentType, title, fetchUrls)
    }
    finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = () => {
    setShowRemoveDialog(true)
  }

  const confirmRemove = async () => {
    setShowRemoveDialog(false)
    setIsProcessing(true)
    try {
      await removeOfflineContent(contentId)
      console.warn('Content removed successfully')
    }
    catch (error) {
      console.error('Failed to remove offline content:', error)
      console.error('Failed to remove offline content')
    }
    finally {
      setIsProcessing(false)
    }
  }

  // Show progress if downloading
  if (progress && progress.status === 'downloading') {
    return (
      <Fragment>
        <div className={cn('space-y-2', className)}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4 animate-pulse" />
            <span>
              Téléchargement...
              {progress.progress}
              %
            </span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {/* Remove Confirmation Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le contenu hors ligne ?</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce contenu hors ligne ? Il ne sera plus
                disponible sans connexion internet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRemove}
                disabled={isProcessing}
              >
                {isProcessing ? 'Suppression...' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }

  // Show error if failed
  if (progress && progress.status === 'error') {
    return (
      <Fragment>
        <div className={cn('space-y-2', className)}>
          <p className="text-sm text-error">{progress.error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isProcessing}
          >
            <Download className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>

        {/* Remove Confirmation Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le contenu hors ligne ?</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce contenu hors ligne ? Il ne sera plus
                disponible sans connexion internet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRemove}
                disabled={isProcessing}
              >
                {isProcessing ? 'Suppression...' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }

  // Show remove button if already offline
  if (isOffline) {
    return (
      <Fragment>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isProcessing}
          className={cn('gap-2', className)}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer hors ligne
        </Button>

        {/* Remove Confirmation Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le contenu hors ligne ?</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce contenu hors ligne ? Il ne sera plus
                disponible sans connexion internet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRemove}
                disabled={isProcessing}
              >
                {isProcessing ? 'Suppression...' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }

  // Show download button
  return (
    <Fragment>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isProcessing}
        className={cn('gap-2', className)}
      >
        <Download className="h-4 w-4" />
        Disponible hors ligne
      </Button>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le contenu hors ligne ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce contenu hors ligne ? Il ne sera plus
              disponible sans connexion internet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={isProcessing}
            >
              {isProcessing ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
