/**
 * Service Worker Update Strategy
 *
 * Implements periodic update checks and lifecycle management
 * for service worker updates with user-friendly prompts
 */

export interface UpdateStrategyConfig {
  /** Interval for periodic update checks in milliseconds (default: 1 hour) */
  updateInterval?: number
  /** Whether to check for updates immediately on registration */
  immediateCheck?: boolean
  /** Whether to skip waiting automatically (default: false, requires user action) */
  autoSkipWaiting?: boolean
  /** Callback when update is found */
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void
  /** Callback when update is ready */
  onUpdateReady?: (registration: ServiceWorkerRegistration) => void
  /** Callback when update is installed */
  onUpdateInstalled?: () => void
}

/**
 * Setup service worker update strategy
 * Configures periodic checks and lifecycle event handlers
 */
export function setupUpdateStrategy(config: UpdateStrategyConfig = {}): () => void {
  const {
    updateInterval = 60 * 60 * 1000, // 1 hour default
    immediateCheck = true,
    autoSkipWaiting = false,
    onUpdateFound,
    onUpdateReady,
    onUpdateInstalled,
  } = config

  if (!('serviceWorker' in navigator)) {
    console.warn('[SW Update] Service Worker not supported')
    return () => { }
  }

  let updateCheckInterval: NodeJS.Timeout | null = null
  const cleanupFunctions: Array<() => void> = []

  // Setup update checks
  navigator.serviceWorker.ready.then((registration) => {
    console.log('[SW Update] Service Worker ready, setting up update strategy')

    // Immediate check if enabled
    if (immediateCheck) {
      checkForUpdate(registration)
    }

    // Periodic update checks
    updateCheckInterval = setInterval(() => {
      checkForUpdate(registration)
    }, updateInterval)

    // Listen for updatefound event
    const handleUpdateFound = () => {
      console.log('[SW Update] Update found')
      const newWorker = registration.installing

      if (!newWorker) {
        return
      }

      onUpdateFound?.(registration)

      // Listen for state changes on the new worker
      const handleStateChange = () => {
        console.log('[SW Update] New worker state:', newWorker.state)

        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New service worker is waiting
            console.log('[SW Update] New service worker waiting')
            onUpdateReady?.(registration)

            // Auto skip waiting if enabled
            if (autoSkipWaiting) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          }
          else {
            // First install
            console.log('[SW Update] Service worker installed for the first time')
            onUpdateInstalled?.()
          }
        }
      }

      newWorker.addEventListener('statechange', handleStateChange)
      cleanupFunctions.push(() => {
        newWorker.removeEventListener('statechange', handleStateChange)
      })
    }

    registration.addEventListener('updatefound', handleUpdateFound)
    cleanupFunctions.push(() => {
      registration.removeEventListener('updatefound', handleUpdateFound)
    })

    // Check if there's already a waiting worker
    if (registration.waiting) {
      console.log('[SW Update] Service worker already waiting')
      onUpdateReady?.(registration)

      if (autoSkipWaiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }
  })

  // Listen for controller change (when new SW takes over)
  const handleControllerChange = () => {
    console.log('[SW Update] Controller changed, reloading page')
    window.location.reload()
  }

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
  cleanupFunctions.push(() => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
  })

  // Return cleanup function
  return () => {
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval)
    }

    cleanupFunctions.forEach(cleanup => cleanup())
  }
}

/**
 * Check for service worker update
 * Fetches the service worker file with cache-busting headers
 */
async function checkForUpdate(registration: ServiceWorkerRegistration): Promise<void> {
  // Don't check if already installing or if offline
  if (registration.installing) {
    console.log('[SW Update] Update already in progress')
    return
  }

  if (!navigator.onLine) {
    console.log('[SW Update] Offline, skipping update check')
    return
  }

  try {
    console.log('[SW Update] Checking for updates...')

    // Fetch service worker with cache-busting headers
    const swUrl = registration.active?.scriptURL || '/sw.js'
    const response = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (response.status === 200) {
      // Trigger update check
      await registration.update()
      console.log('[SW Update] Update check completed')
    }
  }
  catch (error) {
    console.error('[SW Update] Update check failed:', error)
  }
}

/**
 * Manually trigger service worker update
 * Useful for "Check for updates" buttons
 */
export async function triggerUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    console.log('[SW Update] Manual update triggered')
    return true
  }
  catch (error) {
    console.error('[SW Update] Manual update failed:', error)
    return false
  }
}

/**
 * Skip waiting and activate new service worker immediately
 * Should be called when user clicks "Update Now"
 */
export function skipWaiting(registration: ServiceWorkerRegistration): void {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    console.log('[SW Update] Skip waiting message sent')
  }
}

/**
 * Get current service worker registration
 */
export async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    return undefined
  }

  try {
    return await navigator.serviceWorker.ready
  }
  catch {
    return undefined
  }
}

/**
 * Check if service worker update is available
 */
export async function isUpdateAvailable(): Promise<boolean> {
  const registration = await getRegistration()
  return !!registration?.waiting
}
