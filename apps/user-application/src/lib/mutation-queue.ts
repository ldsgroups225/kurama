import type { MutationQueueEntry } from './db'
import { db } from './db'

/**
 * Queue status summary
 */
export interface QueueStatus {
  pending: number
  processing: number
  completed: number
  failed: number
  conflicts: number
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'last-write-wins' | 'manual' | 'merge'

/**
 * Conflict data for resolution
 */
export interface ConflictData {
  mutationId: string
  localData: unknown
  serverData: unknown
  timestamp: number
}

/**
 * Mutation queue manager interface
 */
export interface MutationQueueManager {
  enqueue: (mutation: Omit<MutationQueueEntry, 'id' | 'createdAt' | 'status' | 'retryCount'>) => Promise<string>
  processQueue: () => Promise<void>
  processMutation: (id: string) => Promise<void>
  getQueueStatus: () => Promise<QueueStatus>
  getPendingCount: () => Promise<number>
  clearCompleted: () => Promise<void>
  clearAll: () => Promise<void>
  applyOptimisticUpdate: (mutationId: string, queryKey: string, optimisticData: unknown) => Promise<void>
  revertOptimisticUpdate: (mutationId: string) => Promise<void>
  getConflicts: () => Promise<ConflictData[]>
  resolveConflict: (mutationId: string, strategy: ConflictResolutionStrategy, resolvedData?: unknown) => Promise<void>
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(retryCount: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds
  const delay = Math.min(baseDelay * 2 ** retryCount, maxDelay)

  // Add jitter (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1)
  return Math.floor(delay + jitter)
}

/**
 * Mutation Queue Manager Implementation
 *
 * Manages offline mutations with queuing, retry logic, and error handling.
 * Features:
 * - Automatic retry with exponential backoff (max 5 retries)
 * - Chronological processing order
 * - Status tracking (pending, processing, completed, failed, conflict)
 * - Queue maintenance (clear completed, clear all)
 */
export class MutationQueueManagerImpl implements MutationQueueManager {
  private isProcessing = false
  private maxRetries = 5

  /**
   * Add a mutation to the queue
   * @param mutation - Mutation details without id, createdAt, status, retryCount
   * @returns The generated mutation ID
   */
  async enqueue(
    mutation: Omit<MutationQueueEntry, 'id' | 'createdAt' | 'status' | 'retryCount'>,
  ): Promise<string> {
    const id = generateUUID()
    const entry: MutationQueueEntry = {
      ...mutation,
      id,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
    }

    await db.mutationQueue.add(entry)

    // Apply optimistic update if optimistic data is provided
    if (mutation.optimisticData) {
      const queryKey = this.deriveQueryKeyFromEndpoint(mutation.endpoint)
      await this.applyOptimisticUpdate(id, queryKey, mutation.optimisticData)
    }

    // Register background sync for offline mutations
    await this.registerBackgroundSync()

    // Trigger processing if online
    if (navigator.onLine && !this.isProcessing) {
      // Process asynchronously without blocking
      this.processQueue().catch((error) => {
        console.error('Failed to process queue:', error)
      })
    }

    return id
  }

  /**
   * Register background sync for mutation queue
   * Falls back to online event listener if Background Sync API is not supported
   */
  private async registerBackgroundSync(): Promise<void> {
    try {
      // Check if Background Sync API is supported
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        // Type assertion for Background Sync API
        const syncManager = (registration as any).sync
        if (syncManager) {
          await syncManager.register('sync-mutations')
          // eslint-disable-next-line no-console
          console.log('[MutationQueue] Background sync registered')
        }
        else {
          this.setupOnlineEventFallback()
        }
      }
      else {
        // Fallback: Use online event listener
        this.setupOnlineEventFallback()
      }
    }
    catch (error) {
      console.warn('[MutationQueue] Failed to register background sync:', error)
      // Fallback to online event listener
      this.setupOnlineEventFallback()
    }
  }

  /**
   * Setup fallback for browsers without Background Sync API
   * Processes queue when browser comes back online
   */
  private setupOnlineEventFallback(): void {
    // Only setup once
    if ((window as any).__mutationQueueOnlineListenerSetup) {
      return
    }

    const handleOnline = () => {
      // eslint-disable-next-line no-console
      console.log('[MutationQueue] Online event detected, processing queue')
      this.processQueue().catch((error) => {
        console.error('[MutationQueue] Failed to process queue on online event:', error)
      })
    }

    window.addEventListener('online', handleOnline)
    ; (window as any).__mutationQueueOnlineListenerSetup = true
    // eslint-disable-next-line no-console
    console.log('[MutationQueue] Online event fallback setup complete')
  }

  /**
   * Process all pending mutations in chronological order
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      // Get all pending mutations ordered by creation time
      const pending = await db.mutationQueue
        .where('status')
        .equals('pending')
        .sortBy('createdAt')

      for (const mutation of pending) {
        await this.processMutation(mutation.id)
      }
    }
    finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single mutation by ID
   * @param id - Mutation ID to process
   */
  async processMutation(id: string): Promise<void> {
    const mutation = await db.mutationQueue.get(id)
    if (!mutation) {
      console.warn(`Mutation ${id} not found`)
      return
    }

    // Skip if already processing or completed
    if (mutation.status === 'processing' || mutation.status === 'completed') {
      return
    }

    // Update status to processing
    await db.mutationQueue.update(id, { status: 'processing' })

    try {
      // Determine HTTP method based on mutation type
      const method = this.getHttpMethod(mutation.type)

      // Execute the mutation
      const response = await fetch(mutation.endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mutation.payload),
      })

      if (!response.ok) {
        // Check for conflict status
        if (response.status === 409) {
          // Get server data from response if available
          let serverData: unknown
          try {
            serverData = await response.json()
          }
          catch {
            serverData = null
          }

          // Store conflict with server data
          await db.mutationQueue.update(id, {
            status: 'conflict',
            error: JSON.stringify({
              message: 'Server conflict detected',
              serverData,
              timestamp: Date.now(),
            }),
          })
          return
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse server response
      const serverData = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : null

      // Replace optimistic data with server response
      if (serverData) {
        const queryKey = this.deriveQueryKeyFromEndpoint(mutation.endpoint)
        await this.replaceOptimisticWithServerData(id, queryKey, serverData)
      }

      // Mark as completed
      await db.mutationQueue.update(id, {
        status: 'completed',
        error: undefined,
      })
    }
    catch (error) {
      await this.handleMutationError(id, error as Error)
    }
  }

  /**
   * Handle mutation execution errors with retry logic
   * @param id - Mutation ID
   * @param error - Error that occurred
   */
  private async handleMutationError(id: string, error: Error): Promise<void> {
    const mutation = await db.mutationQueue.get(id)
    if (!mutation)
      return

    const retryCount = mutation.retryCount + 1

    if (retryCount >= this.maxRetries) {
      // Max retries reached, mark as failed and revert optimistic update
      await db.mutationQueue.update(id, {
        status: 'failed',
        error: error.message,
        retryCount,
      })

      // Revert optimistic update
      await this.revertOptimisticUpdate(id)

      console.error(`Mutation ${id} failed after ${this.maxRetries} retries:`, error)
    }
    else {
      // Schedule retry with exponential backoff
      const backoffMs = calculateBackoff(retryCount)

      await db.mutationQueue.update(id, {
        status: 'pending',
        error: error.message,
        retryCount,
      })

      console.warn(
        `Mutation ${id} failed (attempt ${retryCount}/${this.maxRetries}). Retrying in ${backoffMs}ms...`,
      )

      // Schedule retry
      setTimeout(() => {
        this.processMutation(id).catch((err) => {
          console.error(`Retry failed for mutation ${id}:`, err)
        })
      }, backoffMs)
    }
  }

  /**
   * Get HTTP method for mutation type
   */
  private getHttpMethod(type: MutationQueueEntry['type']): string {
    switch (type) {
      case 'create':
        return 'POST'
      case 'update':
        return 'PUT'
      case 'delete':
        return 'DELETE'
      default:
        return 'POST'
    }
  }

  /**
   * Get queue status summary
   * @returns Status counts for each state
   */
  async getQueueStatus(): Promise<QueueStatus> {
    const all = await db.mutationQueue.toArray()

    return {
      pending: all.filter(m => m.status === 'pending').length,
      processing: all.filter(m => m.status === 'processing').length,
      completed: all.filter(m => m.status === 'completed').length,
      failed: all.filter(m => m.status === 'failed').length,
      conflicts: all.filter(m => m.status === 'conflict').length,
    }
  }

  /**
   * Get count of pending mutations
   * @returns Number of pending mutations
   */
  async getPendingCount(): Promise<number> {
    return await db.mutationQueue.where('status').equals('pending').count()
  }

  /**
   * Clear all completed mutations
   */
  async clearCompleted(): Promise<void> {
    await db.mutationQueue.where('status').equals('completed').delete()
  }

  /**
   * Clear all mutations (use with caution)
   */
  async clearAll(): Promise<void> {
    await db.mutationQueue.clear()
  }

  /**
   * Apply optimistic update to query cache
   * @param mutationId - Mutation ID
   * @param queryKey - Query key to update
   * @param optimisticData - Optimistic data to apply
   */
  async applyOptimisticUpdate(
    mutationId: string,
    queryKey: string,
    optimisticData: unknown,
  ): Promise<void> {
    try {
      // Get existing cache entry if it exists
      const existing = await db.queryCache.get(queryKey)

      // Create or update cache entry with optimistic data
      await db.queryCache.put({
        key: queryKey,
        value: optimisticData,
        timestamp: Date.now(),
        staleTime: existing?.staleTime ?? 24 * 60 * 60 * 1000, // Default 24 hours
        pinned: existing?.pinned !== undefined ? existing.pinned : false,
        isOptimistic: true,
        mutationId,
      })
    }
    catch (error) {
      console.error(`Failed to apply optimistic update for mutation ${mutationId}:`, error)
    }
  }

  /**
   * Revert optimistic update for a failed mutation
   * @param mutationId - Mutation ID to revert
   */
  async revertOptimisticUpdate(mutationId: string): Promise<void> {
    try {
      // Find all cache entries with this mutation ID
      const optimisticEntries = await db.queryCache
        .filter(entry => entry.mutationId === mutationId && entry.isOptimistic === true)
        .toArray()

      // Remove optimistic entries
      for (const entry of optimisticEntries) {
        await db.queryCache.delete(entry.key)
      }
    }
    catch (error) {
      console.error(`Failed to revert optimistic update for mutation ${mutationId}:`, error)
    }
  }

  /**
   * Replace optimistic data with server response
   * @param mutationId - Mutation ID
   * @param queryKey - Query key to update
   * @param serverData - Server response data
   */
  private async replaceOptimisticWithServerData(
    mutationId: string,
    queryKey: string,
    serverData: unknown,
  ): Promise<void> {
    try {
      const existing = await db.queryCache.get(queryKey)

      // Only replace if it's an optimistic entry for this mutation
      if (existing?.isOptimistic && existing.mutationId === mutationId) {
        await db.queryCache.put({
          key: queryKey,
          value: serverData,
          timestamp: Date.now(),
          staleTime: existing.staleTime,
          pinned: existing.pinned,
          isOptimistic: false,
          mutationId: undefined,
        })
      }
    }
    catch (error) {
      console.error(`Failed to replace optimistic data for mutation ${mutationId}:`, error)
    }
  }

  /**
   * Derive query key from API endpoint
   * @param endpoint - API endpoint
   * @returns Query key string
   */
  private deriveQueryKeyFromEndpoint(endpoint: string): string {
    // Simple derivation: use endpoint as key
    // In a real app, this would be more sophisticated
    return endpoint
  }

  /**
   * Get all conflicts from the mutation queue
   * @returns Array of conflict data
   */
  async getConflicts(): Promise<ConflictData[]> {
    const conflicts = await db.mutationQueue
      .where('status')
      .equals('conflict')
      .toArray()

    return conflicts.map((mutation) => {
      let serverData: unknown = null
      let timestamp = mutation.createdAt

      // Parse error field to extract server data
      if (mutation.error) {
        try {
          const errorData = JSON.parse(mutation.error)
          serverData = errorData.serverData
          timestamp = errorData.timestamp || mutation.createdAt
        }
        catch {
          // Error is just a string, no server data
        }
      }

      return {
        mutationId: mutation.id,
        localData: mutation.payload,
        serverData,
        timestamp,
      }
    })
  }

  /**
   * Resolve a conflict using the specified strategy
   * @param mutationId - Mutation ID to resolve
   * @param strategy - Resolution strategy to use
   * @param resolvedData - Manually resolved data (for 'manual' strategy)
   */
  async resolveConflict(
    mutationId: string,
    strategy: ConflictResolutionStrategy,
    resolvedData?: unknown,
  ): Promise<void> {
    const mutation = await db.mutationQueue.get(mutationId)
    if (!mutation || mutation.status !== 'conflict') {
      throw new Error(`Mutation ${mutationId} is not in conflict status`)
    }

    let finalData: unknown

    switch (strategy) {
      case 'last-write-wins':
        // Use local data (last write wins)
        finalData = mutation.payload
        break

      case 'manual':
        // Use manually resolved data
        if (!resolvedData) {
          throw new Error('Manual resolution requires resolvedData parameter')
        }
        finalData = resolvedData
        break

      case 'merge':
        // Merge local and server data
        finalData = await this.mergeConflictData(mutation)
        break

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`)
    }

    // Update mutation with resolved data and reset to pending
    await db.mutationQueue.update(mutationId, {
      payload: finalData,
      status: 'pending',
      error: undefined,
      retryCount: 0,
    })

    // Trigger processing
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue().catch((error) => {
        console.error('Failed to process queue after conflict resolution:', error)
      })
    }
  }

  /**
   * Merge local and server data for conflict resolution
   * @param mutation - Mutation entry with conflict
   * @returns Merged data
   */
  private async mergeConflictData(mutation: MutationQueueEntry): Promise<unknown> {
    let serverData: unknown = null

    // Extract server data from error field
    if (mutation.error) {
      try {
        const errorData = JSON.parse(mutation.error)
        serverData = errorData.serverData
      }
      catch {
        // No server data available, use local data
        return mutation.payload
      }
    }

    // Simple merge: combine non-conflicting properties
    if (
      typeof mutation.payload === 'object'
      && mutation.payload !== null
      && typeof serverData === 'object'
      && serverData !== null
    ) {
      // Merge objects, local data takes precedence for conflicts
      return {
        ...serverData,
        ...mutation.payload,
      }
    }

    // For non-objects, use local data
    return mutation.payload
  }
}

/**
 * Singleton instance of the mutation queue manager
 */
let mutationQueueManager: MutationQueueManager | null = null

/**
 * Get or create the mutation queue manager instance
 */
export function getMutationQueueManager(): MutationQueueManager {
  if (!mutationQueueManager) {
    mutationQueueManager = new MutationQueueManagerImpl()
  }
  return mutationQueueManager
}
