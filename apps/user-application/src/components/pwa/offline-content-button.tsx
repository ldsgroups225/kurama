import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

  const handleRemove = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce contenu hors ligne ?',
    )
    if (!confirmed)
      return

    setIsProcessing(true)
    try {
      await removeOfflineContent(contentId)
    }
    finally {
      setIsProcessing(false)
    }
  }

  // Show progress if downloading
  if (progress && progress.status === 'downloading') {
    return (
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
    )
  }

  // Show error if failed
  if (progress && progress.status === 'error') {
    return (
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
    )
  }

  // Show remove button if already offline
  if (isOffline) {
    return (
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
    )
  }

  // Show download button
  return (
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
  )
}
