import { getMutationQueueManager } from './mutation-queue'

/**
 * Setup service worker message handler for background sync
 * Listens for SYNC_MUTATIONS messages from the service worker
 */
/* eslint-disable no-console */
export function setupServiceWorkerSyncHandler(): void {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW Sync] Service Worker not supported')
    return
  }

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'SYNC_MUTATIONS') {
      console.log('[SW Sync] Received SYNC_MUTATIONS message from service worker')

      try {
        // Get mutation queue manager
        const queueManager = getMutationQueueManager()

        // Process the queue
        await queueManager.processQueue()

        // Send success response back to service worker
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true })
        }

        console.log('[SW Sync] Mutation queue processed successfully')
      }
      catch (error) {
        console.error('[SW Sync] Failed to process mutation queue:', error)

        // Send error response back to service worker
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }
  })

  console.log('[SW Sync] Service worker sync handler setup complete')
}
