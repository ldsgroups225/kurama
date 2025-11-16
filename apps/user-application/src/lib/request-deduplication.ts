/**
 * Request Deduplication Utility
 *
 * Prevents duplicate concurrent requests to the same URL
 * Useful for service worker fetch handlers to avoid redundant network calls
 */

interface PendingRequest {
  promise: Promise<Response>
  timestamp: number
}

/**
 * Request deduplication manager
 * Ensures only one request per URL is in flight at a time
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map()
  private maxAge: number = 5000 // 5 seconds max age for pending requests

  /**
   * Get or create a request
   * If a request for the same URL is already in flight, return that promise
   * Otherwise, create a new request
   *
   * @param url - Request URL
   * @param requestFn - Function that returns a Promise<Response>
   * @returns Promise<Response>
   */
  async deduplicate(
    url: string,
    requestFn: () => Promise<Response>,
  ): Promise<Response> {
    // Clean up stale pending requests
    this.cleanup()

    // Check if request is already pending
    const pending = this.pendingRequests.get(url)
    if (pending) {
      console.warn(`[RequestDedup] Reusing pending request for: ${url}`)
      return pending.promise.then(response => response.clone())
    }

    // Create new request
    const promise = requestFn()

    // Store pending request
    this.pendingRequests.set(url, {
      promise,
      timestamp: Date.now(),
    })

    try {
      const response = await promise

      // Remove from pending after completion
      this.pendingRequests.delete(url)

      return response
    }
    catch (error) {
      // Remove from pending on error
      this.pendingRequests.delete(url)
      throw error
    }
  }

  /**
   * Clean up stale pending requests
   * Removes requests that have been pending for too long
   */
  private cleanup(): void {
    const now = Date.now()
    const staleUrls: string[] = []

    for (const [url, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > this.maxAge) {
        staleUrls.push(url)
      }
    }

    for (const url of staleUrls) {
      this.pendingRequests.delete(url)
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear()
  }

  /**
   * Get number of pending requests
   */
  get size(): number {
    return this.pendingRequests.size
  }
}

/**
 * Singleton instance for service worker
 */
let deduplicator: RequestDeduplicator | null = null

/**
 * Get request deduplicator instance
 */
export function getRequestDeduplicator(): RequestDeduplicator {
  if (!deduplicator) {
    deduplicator = new RequestDeduplicator()
  }
  return deduplicator
}
