import { db } from './db'

/**
 * Cache eviction service for automatic storage management
 * Implements LRU (Least Recently Used) eviction strategy
 */

export interface EvictionResult {
  evictedCount: number
  freedBytes: number
  remainingUsage: number
  remainingQuota: number
}

export interface StorageStats {
  usage: number
  quota: number
  usagePercent: number
  isNearLimit: boolean
}

/**
 * Get current storage statistics
 */
export async function getStorageStats(): Promise<StorageStats> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const usagePercent = quota > 0 ? (usage / quota) * 100 : 0

      return {
        usage,
        quota,
        usagePercent,
        isNearLimit: usagePercent >= 80,
      }
    }

    // Fallback for unsupported browsers
    return {
      usage: 0,
      quota: 0,
      usagePercent: 0,
      isNearLimit: false,
    }
  }
  catch (error) {
    console.error('Failed to get storage stats:', error)
    return {
      usage: 0,
      quota: 0,
      usagePercent: 0,
      isNearLimit: false,
    }
  }
}

/**
 * Perform automatic cache eviction when storage quota exceeds threshold
 * @param threshold - Percentage threshold (default: 80%)
 * @returns Eviction result with statistics
 */
export async function performCacheEviction(threshold = 80): Promise<EvictionResult> {
  const stats = await getStorageStats()

  // Check if eviction is needed
  if (stats.usagePercent < threshold) {
    return {
      evictedCount: 0,
      freedBytes: 0,
      remainingUsage: stats.usage,
      remainingQuota: stats.quota,
    }
  }

  console.warn(`Storage quota at ${stats.usagePercent.toFixed(1)}%, starting eviction...`)

  let evictedCount = 0

  try {
    // Get all query cache entries sorted by timestamp (oldest first)
    // Exclude pinned content
    const candidates = await db.queryCache
      .where('pinned')
      .equals(0)
      .sortBy('timestamp')

    // Calculate target usage (reduce to 60% of quota)
    const targetUsage = stats.quota * 0.6
    const bytesToFree = stats.usage - targetUsage

    let freedBytes = 0

    // Evict entries until we reach target or run out of candidates
    for (const entry of candidates) {
      if (freedBytes >= bytesToFree) {
        break
      }

      try {
        // Estimate entry size (rough approximation)
        const entrySize = JSON.stringify(entry.value).length * 2 // UTF-16 encoding

        // Delete the entry
        await db.queryCache.delete(entry.key)
        evictedCount++
        freedBytes += entrySize

        console.warn(`Evicted cache entry: ${entry.key} (~${entrySize} bytes)`)
      }
      catch (error) {
        console.error(`Failed to evict entry ${entry.key}:`, error)
      }
    }

    // Also clean up old completed mutations (older than 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const oldMutations = await db.mutationQueue
      .where('status')
      .equals('completed')
      .and(mutation => mutation.createdAt < oneDayAgo)
      .toArray()

    for (const mutation of oldMutations) {
      try {
        await db.mutationQueue.delete(mutation.id)
        evictedCount++
      }
      catch (error) {
        console.error(`Failed to delete mutation ${mutation.id}:`, error)
      }
    }

    // Get updated storage stats
    const updatedStats = await getStorageStats()

    console.warn(
      `Eviction complete: ${evictedCount} entries removed, `
      + `freed ~${freedBytes} bytes, `
      + `usage now at ${updatedStats.usagePercent.toFixed(1)}%`,
    )

    return {
      evictedCount,
      freedBytes,
      remainingUsage: updatedStats.usage,
      remainingQuota: updatedStats.quota,
    }
  }
  catch (error) {
    console.error('Cache eviction failed:', error)
    return {
      evictedCount,
      freedBytes: 0,
      remainingUsage: stats.usage,
      remainingQuota: stats.quota,
    }
  }
}

/**
 * Monitor storage and automatically trigger eviction when needed
 * Should be called periodically or on app startup
 */
export async function monitorAndEvict(): Promise<void> {
  const stats = await getStorageStats()

  if (stats.isNearLimit) {
    console.warn('Storage limit approaching, triggering automatic eviction...')
    await performCacheEviction()
  }
}

/**
 * Set up periodic storage monitoring
 * @param intervalMs - Check interval in milliseconds (default: 5 minutes)
 * @returns Cleanup function to stop monitoring
 */
export function setupStorageMonitoring(intervalMs = 5 * 60 * 1000): () => void {
  // Initial check
  monitorAndEvict()

  // Set up periodic checks
  const intervalId = setInterval(() => {
    monitorAndEvict()
  }, intervalMs)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}

/**
 * Evict specific cache entries by key pattern
 * @param pattern - RegExp pattern to match cache keys
 * @returns Number of evicted entries
 */
export async function evictByPattern(pattern: RegExp): Promise<number> {
  try {
    const entries = await db.queryCache.toArray()
    let evictedCount = 0

    for (const entry of entries) {
      if (pattern.test(entry.key) && !entry.pinned) {
        await db.queryCache.delete(entry.key)
        evictedCount++
      }
    }

    console.warn(`Evicted ${evictedCount} entries matching pattern: ${pattern}`)
    return evictedCount
  }
  catch (error) {
    console.error('Pattern-based eviction failed:', error)
    return 0
  }
}

/**
 * Get eviction candidates (entries that would be evicted)
 * Useful for preview before actual eviction
 * @param limit - Maximum number of candidates to return
 */
export async function getEvictionCandidates(limit = 10) {
  try {
    const candidates = await db.queryCache
      .where('pinned')
      .equals(0)
      .sortBy('timestamp')

    return candidates.slice(0, limit).map(entry => ({
      key: entry.key,
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
      size: JSON.stringify(entry.value).length * 2,
    }))
  }
  catch (error) {
    console.error('Failed to get eviction candidates:', error)
    return []
  }
}
