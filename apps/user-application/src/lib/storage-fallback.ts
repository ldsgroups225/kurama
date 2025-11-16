/**
 * Storage Fallback Utilities
 *
 * Provides fallback storage mechanisms when IndexedDB is unavailable
 */

import type { MutationQueueEntry, QueryCacheEntry } from './db'

/**
 * In-memory storage for when all other storage mechanisms fail
 */
class MemoryStorage {
  private store: Map<string, any> = new Map()

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  get length(): number {
    return this.store.size
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys())
    return keys[index] || null
  }
}

/**
 * Get available storage mechanism
 * Priority: sessionStorage > localStorage > memory
 */
function getStorage(): Storage {
  // Try sessionStorage first (more reliable for temporary data)
  try {
    sessionStorage.setItem('__test__', 'test')
    sessionStorage.removeItem('__test__')
    return sessionStorage
  }
  catch {
    // sessionStorage not available
  }

  // Try localStorage
  try {
    localStorage.setItem('__test__', 'test')
    localStorage.removeItem('__test__')
    return localStorage
  }
  catch {
    // localStorage not available
  }

  // Fallback to in-memory storage
  return new MemoryStorage() as Storage
}

/**
 * Fallback storage for mutation queue
 */
export class MutationQueueFallback {
  private storage: Storage
  private storageKey = 'kurama_mutation_queue'

  constructor() {
    this.storage = getStorage()
  }

  /**
   * Add mutation to queue
   */
  async add(mutation: MutationQueueEntry): Promise<void> {
    const queue = await this.getAll()
    queue.push(mutation)
    this.storage.setItem(this.storageKey, JSON.stringify(queue))
  }

  /**
   * Get all mutations
   */
  async getAll(): Promise<MutationQueueEntry[]> {
    try {
      const data = this.storage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    }
    catch {
      return []
    }
  }

  /**
   * Get mutation by ID
   */
  async get(id: string): Promise<MutationQueueEntry | undefined> {
    const queue = await this.getAll()
    return queue.find(m => m.id === id)
  }

  /**
   * Update mutation
   */
  async update(id: string, updates: Partial<MutationQueueEntry>): Promise<void> {
    const queue = await this.getAll()
    const index = queue.findIndex(m => m.id === id)

    if (index !== -1) {
      const existingEntry = queue[index]
      if (!existingEntry) {
        return
      }

      // Ensure required fields are preserved
      const updatedEntry: MutationQueueEntry = {
        ...existingEntry,
        id,
        ...updates as Partial<MutationQueueEntry>,
        type: updates.type || existingEntry.type,
        status: updates.status || existingEntry.status,
        retryCount: updates.retryCount ?? existingEntry.retryCount,
        createdAt: updates.createdAt || existingEntry.createdAt,
        userId: updates.userId || existingEntry.userId,
        dependencies: updates.dependencies ?? existingEntry.dependencies,
      }

      queue[index] = updatedEntry
      this.storage.setItem(this.storageKey, JSON.stringify(queue))
    }
  }

  /**
   * Delete mutation
   */
  async delete(id: string): Promise<void> {
    const queue = await this.getAll()
    const filtered = queue.filter(m => m.id !== id)
    this.storage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  /**
   * Get mutations by status
   */
  async getByStatus(status: MutationQueueEntry['status']): Promise<MutationQueueEntry[]> {
    const queue = await this.getAll()
    return queue.filter(m => m.status === status)
  }

  /**
   * Clear all mutations
   */
  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey)
  }

  /**
   * Get count of mutations
   */
  async count(): Promise<number> {
    const queue = await this.getAll()
    return queue.length
  }
}

/**
 * Fallback storage for query cache
 */
export class QueryCacheFallback {
  private storage: Storage
  private storageKey = 'kurama_query_cache'

  constructor() {
    this.storage = getStorage()
  }

  /**
   * Put cache entry
   */
  async put(entry: QueryCacheEntry): Promise<void> {
    const cache = await this.getAll()

    // Find existing entry
    const index = cache.findIndex(c => c.key === entry.key)

    if (index !== -1) {
      cache[index] = entry
    }
    else {
      cache.push(entry)
    }

    // Limit cache size to prevent storage quota issues
    const maxEntries = 50
    if (cache.length > maxEntries) {
      // Remove oldest entries
      cache.sort((a, b) => a.timestamp - b.timestamp)
      cache.splice(0, cache.length - maxEntries)
    }

    this.storage.setItem(this.storageKey, JSON.stringify(cache))
  }

  /**
   * Get cache entry
   */
  async get(key: string): Promise<QueryCacheEntry | undefined> {
    const cache = await this.getAll()
    return cache.find(c => c.key === key)
  }

  /**
   * Get all cache entries
   */
  async getAll(): Promise<QueryCacheEntry[]> {
    try {
      const data = this.storage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    }
    catch {
      return []
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    const cache = await this.getAll()
    const filtered = cache.filter(c => c.key !== key)
    this.storage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey)
  }

  /**
   * Filter cache entries
   */
  async filter(predicate: (entry: QueryCacheEntry) => boolean): Promise<QueryCacheEntry[]> {
    const cache = await this.getAll()
    return cache.filter(predicate)
  }
}

/**
 * Polling-based sync for browsers without Background Sync API
 */
export class PollingSync {
  private intervalId: number | null = null
  private pollInterval = 30000 // 30 seconds
  private onSync: () => Promise<void>

  constructor(onSync: () => Promise<void>) {
    this.onSync = onSync
  }

  /**
   * Start polling
   */
  start(): void {
    if (this.intervalId !== null) {
      return // Already running
    }

    // Initial sync
    this.sync()

    // Setup interval
    this.intervalId = window.setInterval(() => {
      this.sync()
    }, this.pollInterval)

    console.warn('[PollingSync] Started polling every', this.pollInterval / 1000, 'seconds')
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
      console.warn('[PollingSync] Stopped polling')
    }
  }

  /**
   * Perform sync
   */
  private async sync(): Promise<void> {
    // Only sync when online
    if (!navigator.onLine) {
      return
    }

    try {
      await this.onSync()
    }
    catch (error) {
      console.error('[PollingSync] Sync failed:', error)
    }
  }

  /**
   * Change poll interval
   */
  setInterval(ms: number): void {
    this.pollInterval = ms

    // Restart if already running
    if (this.intervalId !== null) {
      this.stop()
      this.start()
    }
  }
}

/**
 * Check if we should use fallback storage
 */
export function shouldUseFallback(): boolean {
  return !('indexedDB' in window)
}
