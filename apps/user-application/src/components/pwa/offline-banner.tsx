import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '@/hooks'

/**
 * Offline Banner Component
 * Shows a banner when the app is offline
 */
export function OfflineBanner() {
  const { isOnline } = useOnlineStatus()
  const [bannerState, setBannerState] = useState<'hidden' | 'offline' | 'back-online'>('hidden')
  const previousOnlineRef = useRef(isOnline)

  // Handle online/offline state changes

  useEffect(() => {
    const wasOnline = previousOnlineRef.current
    previousOnlineRef.current = isOnline

    // Transition from online to offline
    if (wasOnline && !isOnline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
      setBannerState('offline')
    }
    // Transition from offline to online
    else if (!wasOnline && isOnline && bannerState === 'offline') {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setBannerState('back-online')
      const timer = setTimeout(() => {
        setBannerState('hidden')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, bannerState])

  // Don't show banner if hidden
  if (bannerState === 'hidden') {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white ${bannerState === 'back-online' ? 'bg-success' : 'bg-warning'
        }`}
      >
        {bannerState === 'back-online'
          ? (
              <>
                <Wifi className="h-4 w-4" />
                <span>Connexion rétablie</span>
              </>
            )
          : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Mode hors ligne</span>
              </>
            )}
      </div>
    </div>
  )
}
