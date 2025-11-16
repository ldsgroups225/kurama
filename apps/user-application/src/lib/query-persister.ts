import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { db } from './db'

/**
 * Cache version for invalidating old cache data
 * Increment this when making breaking changes to cache structure
 */
const CACHE_VERSION = 1

/**
 * Creates a Dexie-based persister for TanStack Query
 * Stores query cache in IndexedDB for offline access
 */
export function createDexiePersister(): Persister {
  return {
    /**
     * Persist the query client state to IndexedDB
     */
    persistClient: async (client: PersistedClient) => {
      const key = `tanstack-query-cache-v${CACHE_VERSION}`

      try {
        await db.queryCache.put({
          key,
          value: client,
          timestamp: Date.now(),
          staleTime: 24 * 60 * 60 * 1000, // 24 hours
          pinned: false,
        })
      } catch (error) {
        console.error('Failed to persist query cache:', error)
        // Don't throw - allow app to continue without persistence
      }
    },

    /**
     * Restore the query client state from IndexedDB
     */
    restoreClient: async () => {
      const key = `tanstack-query-cache-v${CACHE_VERSION}`

      try {
        const cached = await db.queryCache.get(key)

        if (!cached) {
          return undefined
        }

        // Check if cache is stale
        const age = Date.now() - cached.timestamp
        if (age > cached.staleTime && !cached.pinned) {
          // Cache is stale and not pinned - remove it
          await db.queryCache.delete(key)
          return undefined
        }

        return cached.value as PersistedClient
      } catch (error) {
        console.error('Failed to restore query cache:', error)
        return undefined
      }
    },

    /**
     * Remove the query client state from IndexedDB
     */
    removeClient: async () => {
      const key = `tanstack-query-cache-v${CACHE_VERSION}`

      try {
        await db.queryCache.delete(key)
      } catch (error) {
        console.error('Failed to remove query cache:', error)
        // Don't throw - allow app to continue
      }
    },
  }
}

/**
 * Get the size of the query cache in bytes (approximate)
 */
export async function getQueryCacheSize(): Promise<number> {
  try {
    const entries = await db.queryCache.toArray()
    const jsonString = JSON.stringify(entries)
    return new Blob([jsonString]).size
  } catch (error) {
    console.error('Failed to calculate query cache size:', error)
    return 0
  }
}

/**
 * Clear old query cache entries (older than specified days)
 */
export async function clearOldQueryCache(daysOld: number = 7): Promise<number> {
  try {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000
    const oldEntries = await db.queryCache
      .where('timestamp')
      .below(cutoffTime)
      .and((entry) => !entry.pinned) // Don't delete pinned entries
      .toArray()

    const keys = oldEntries.map((entry) => entry.key)
    await db.queryCache.bulkDelete(keys)

    return keys.length
  } catch (error) {
    console.error('Failed to clear old query cache:', error)
    return 0
  }
}

/**
 * Pin a query cache entry to prevent eviction
 */
export async function pinQueryCache(key: string): Promise<void> {
  try {
    await db.queryCache.update(key, { pinned: true })
  } catch (error) {
    console.error('Failed to pin query cache:', error)
  }
}

/**
 * Unpin a query cache entry
 */
export async function unpinQueryCache(key: string): Promise<void> {
  try {
    await db.queryCache.update(key, { pinned: false })
  } catch (error) {
    console.error('Failed to unpin query cache:', error)
  }
}
