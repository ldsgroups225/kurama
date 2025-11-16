import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOnlineStatus } from '@/hooks'

/**
 * Offline Banner Component
 * Shows a banner when the app is offline
 */
export function OfflineBanner() {
  const { isOnline } = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      setShowOnlineMessage(false)
    }
    else if (wasOffline) {
      // Show "back online" message
      setShowOnlineMessage(true)
      const timer = setTimeout(() => {
        setShowOnlineMessage(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  // Show banner when offline or when showing "back online" message
  if (!wasOffline && !showOnlineMessage) {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white ${showOnlineMessage ? 'bg-success' : 'bg-warning'
          }`}
      >
        {showOnlineMessage
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
