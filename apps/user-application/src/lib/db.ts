import type { EntityTable } from 'dexie'
import Dexie from 'dexie'

/**
 * Query cache entry for TanStack Query persistence
 */
export interface QueryCacheEntry {
  key: string // Query key (stringified)
  value: unknown // Cached query data
  timestamp: number // When cached (ms)
  staleTime: number // How long until stale (ms)
  pinned: boolean // Prevent eviction
}

/**
 * Mutation queue entry for offline write operations
 */
export interface MutationQueueEntry {
  id: string // Unique mutation ID (UUID)
  type: 'create' | 'update' | 'delete' // Operation type
  endpoint: string // API endpoint
  payload: unknown // Request payload
  optimisticData: unknown // For UI updates
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict' // Mutation status
  retryCount: number // Retry attempts
  error?: string // Last error message
  createdAt: number // Timestamp (ms)
  userId: string // Associated user
  dependencies: string[] // Dependent mutation IDs
}

/**
 * App-level state storage
 */
export interface AppState {
  key: string // State key
  value: unknown // State value
}

/**
 * Authentication state with encrypted token storage
 */
export interface AuthState {
  userId: string // User ID (primary key)
  token: string // JWT token (encrypted)
  expiryTime: number // Token expiry timestamp (ms)
  encryptedData: string // Additional encrypted sensitive data
}

/**
 * Kurama IndexedDB database
 * Stores offline data for PWA functionality
 */
export class KuramaDB extends Dexie {
  // Tables
  queryCache!: EntityTable<QueryCacheEntry, 'key'>
  mutationQueue!: EntityTable<MutationQueueEntry, 'id'>
  appState!: EntityTable<AppState, 'key'>
  authState!: EntityTable<AuthState, 'userId'>

  constructor() {
    super('KuramaDB')

    // Define schema version 1
    this.version(1).stores({
      // Query cache: indexed by key, timestamp, and pinned status
      queryCache: 'key, timestamp, pinned',

      // Mutation queue: indexed by id, status, createdAt, userId, and dependencies
      mutationQueue: 'id, status, createdAt, userId, *dependencies',

      // App state: simple key-value store
      appState: 'key',

      // Auth state: indexed by userId
      authState: 'userId',
    })
  }
}

// Export singleton instance
export const db = new KuramaDB()
