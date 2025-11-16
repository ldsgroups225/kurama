import { RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setupUpdateStrategy, skipWaiting } from '@/lib/sw-update-strategy'

/**
 * Update Prompt Component
 * Shows a prompt when a new service worker version is available
 * Uses the enhanced update strategy with periodic checks every hour
 */
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Setup update strategy with periodic checks every hour
    const cleanup = setupUpdateStrategy({
      updateInterval: 60 * 60 * 1000, // 1 hour
      immediateCheck: true,
      autoSkipWaiting: false, // Require user action
      onUpdateReady: (reg) => {
        console.warn('[UpdatePrompt] Update ready, showing prompt')
        setRegistration(reg)
        setShowPrompt(true)
      },
      onUpdateInstalled: () => {
        console.warn('[UpdatePrompt] First install complete')
      },
    })

    return cleanup
  }, [])

  const handleUpdate = () => {
    if (!registration) {
      return
    }

    // Tell the waiting service worker to skip waiting and become active
    skipWaiting(registration)
    setShowPrompt(false)
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
