import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Update Prompt Component
 * Shows a prompt when a new service worker version is available
 */
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const checkForUpdates = async () => {
      const registration = await navigator.serviceWorker.ready

      // Check for updates every hour
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)

      // Listen for new service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        if (!newWorker) {
          return
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is installed and waiting
            setWaitingWorker(newWorker)
            setShowPrompt(true)
          }
        })
      })

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowPrompt(true)
      }
    }

    checkForUpdates()

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to use the new service worker
      window.location.reload()
    })
  }, [])

  const handleUpdate = () => {
    if (!waitingWorker) {
      return
    }

    // Tell the waiting service worker to skip waiting and become active
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-info bg-info shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-info" />
              <CardTitle className="text-base">Mise à jour disponible</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Une nouvelle version de l'application est disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Plus tard
          </Button>
          <Button
            size="sm"
            onClick={handleUpdate}
            className="flex-1"
          >
            Mettre à jour
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
