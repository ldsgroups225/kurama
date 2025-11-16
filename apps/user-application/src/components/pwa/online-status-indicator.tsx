import { Wifi, WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks'

/**
 * Simple component to display online/offline status
 * Used for testing the useOnlineStatus hook
 */
export function OnlineStatusIndicator() {
  const { isOnline, offlineDuration, isChecking } = useOnlineStatus()

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-success" />
          <span className="text-success">
            En ligne {isChecking && '(vérification...)'}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-error" />
          <span className="text-error">
            Hors ligne {offlineDuration > 0 && `depuis ${formatDuration(offlineDuration)}`}
          </span>
        </>
      )}
    </div>
  )
}
