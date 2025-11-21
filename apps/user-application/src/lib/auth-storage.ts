import { db } from './db'

/**
 * Auth storage manager for encrypted token persistence
 * Uses Web Crypto API for secure token encryption in IndexedDB
 */

// Encryption configuration
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for AES-GCM
const TAG_LENGTH = 128 // 128 bits authentication tag

/**
 * Generate a cryptographic key from a password/seed
 * Uses PBKDF2 for key derivation
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  )

  // Derive AES key using PBKDF2

  // Convert salt to proper ArrayBuffer type for crypto API compatibility
  const saltBuffer = new Uint8Array(salt)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // Not extractable
    ['encrypt', 'decrypt'],
  )
}

/**
 * Get or generate encryption key for the current session
 * Key is stored in memory only and regenerated on each session
 */
let sessionKey: CryptoKey | null = null
let sessionSalt: Uint8Array | null = null

async function getSessionKey(): Promise<{ key: CryptoKey, salt: Uint8Array }> {
  if (sessionKey && sessionSalt) {
    return { key: sessionKey, salt: sessionSalt }
  }

  // Generate new salt for this session
  sessionSalt = crypto.getRandomValues(new Uint8Array(16))

  // Use a session-specific seed (could be enhanced with device fingerprint)
  const seed = `kurama-auth-${Date.now()}-${Math.random()}`

  sessionKey = await deriveKey(seed, sessionSalt)

  return { key: sessionKey, salt: sessionSalt }
}

/**
 * Encrypt a token using AES-GCM
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    const { key } = await getSessionKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(token)

    // Generate random IV for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Encrypt the token
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      data,
    )

    // Combine IV + encrypted data for storage
    const encryptedArray = new Uint8Array(encryptedBuffer)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv, 0)
    combined.set(encryptedArray, iv.length)

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined))
  }
  catch (error) {
    console.error('Token encryption failed:', error)
    throw new Error('Failed to encrypt authentication token')
  }
}

/**
 * Decrypt a token using AES-GCM
 * Expects base64-encoded data with IV prepended
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    const { key } = await getSessionKey()

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0))

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH)
    const encryptedData = combined.slice(IV_LENGTH)

    // Decrypt the token
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedData,
    )

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  }
  catch {
    // Silently handle decryption errors - likely due to session key mismatch
    // This is expected when tokens were encrypted in a previous session
    throw new Error('Failed to decrypt authentication token')
  }
}

/**
 * Store authentication state in IndexedDB
 * Token is encrypted before storage
 */
export async function storeAuthState(
  userId: string,
  token: string,
  expiryTime: number,
  additionalData?: Record<string, unknown>,
): Promise<void> {
  try {
    // Encrypt the token
    const encryptedToken = await encryptToken(token)

    // Encrypt additional data if provided
    let encryptedData = ''
    if (additionalData) {
      const dataString = JSON.stringify(additionalData)
      encryptedData = await encryptToken(dataString)
    }

    // Store in IndexedDB
    await db.authState.put({
      userId,
      token: encryptedToken,
      expiryTime,
      encryptedData,
    })
  }
  catch (error) {
    console.error('Failed to store auth state:', error)
    throw new Error('Failed to persist authentication state')
  }
}

/**
 * Retrieve and validate authentication state from IndexedDB
 * Returns null if token is expired or invalid
 */
export async function getAuthState(
  userId: string,
): Promise<{ token: string, expiryTime: number, additionalData?: Record<string, unknown> } | null> {
  try {
    // Retrieve from IndexedDB
    const authState = await db.authState.get(userId)

    if (!authState) {
      return null
    }

    // Check if token is expired
    if (Date.now() >= authState.expiryTime) {
      // Clean up expired token
      await clearAuthState(userId)
      return null
    }

    // Decrypt the token
    const token = await decryptToken(authState.token)

    // Decrypt additional data if present
    let additionalData: Record<string, unknown> | undefined
    if (authState.encryptedData) {
      const decryptedDataString = await decryptToken(authState.encryptedData)
      additionalData = JSON.parse(decryptedDataString)
    }

    return {
      token,
      expiryTime: authState.expiryTime,
      additionalData,
    }
  }
  catch {
    // Silently handle decryption errors - this is expected when session keys change
    // Clear the corrupted/outdated state without logging errors
    await clearAuthState(userId).catch(() => { })
    return null
  }
}

/**
 * Clear authentication state from IndexedDB
 * Should be called on logout or token expiry
 */
export async function clearAuthState(userId: string): Promise<void> {
  try {
    await db.authState.delete(userId)
  }
  catch (error) {
    console.error('Failed to clear auth state:', error)
    throw new Error('Failed to clear authentication state')
  }
}

/**
 * Clear user-specific authentication data (for logout)
 *
 * CLEARS (user-specific data):
 * - IndexedDB: authState, mutationQueue (user's pending operations)
 * - Jotai atoms: userProfile, onboarding status (via RESET)
 * - Memory: session encryption keys
 *
 * PRESERVES (app-level data):
 * - queryCache: Curriculum data, subjects, lessons (not user-specific)
 * - appState: App configuration, feature flags
 * - ui-theme: User's theme preference
 * - pwa-install-dismissed: Don't spam install prompt
 */
export async function clearUserAuthData(): Promise<void> {
  try {
    // Clear user-specific IndexedDB data
    await Promise.all([
      db.authState.clear(), // Auth tokens
      db.mutationQueue.clear(), // User's pending mutations
      // Preserve queryCache - contains curriculum data that's not user-specific
      // Preserve appState - contains app-level configuration
    ])

    // Clear session encryption keys
    sessionKey = null
    sessionSalt = null

    // Reset Jotai atoms to their initial values (proper way)
    if (typeof window !== 'undefined' && window.localStorage) {
      // Reset user profile atom
      localStorage.removeItem('kurama:userProfile')

      // Reset onboarding status
      localStorage.removeItem('kurama:hasCompletedOnboarding')

      // Preserve theme preference - users expect this to persist
      // Preserve PWA install dismissed - don't spam them
    }
  }
  catch (error) {
    console.error('Failed to clear user auth data:', error)
    throw new Error('Failed to clear user authentication data')
  }
}

/**
 * Clear ALL data (for debugging or complete reset)
 * Use this only when you need to completely reset the app
 */
export async function clearAllAuthStates(): Promise<void> {
  try {
    // Clear all IndexedDB tables
    await Promise.all([
      db.authState.clear(),
      db.queryCache.clear(),
      db.mutationQueue.clear(),
      db.appState.clear(),
    ])

    // Clear session encryption keys
    sessionKey = null
    sessionSalt = null

    // Clear all localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('kurama:')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }
  catch (error) {
    console.error('Failed to clear all auth states:', error)
    throw new Error('Failed to clear all authentication states')
  }
}

/**
 * Check if a token is about to expire (within 5 minutes)
 * Useful for triggering token refresh
 */
export function isTokenExpiringSoon(expiryTime: number, thresholdMs = 5 * 60 * 1000): boolean {
  return Date.now() >= expiryTime - thresholdMs
}

/**
 * Validate token format (basic JWT structure check)
 */
export function isValidTokenFormat(token: string): boolean {
  // Basic JWT format: header.payload.signature
  const parts = token.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}
