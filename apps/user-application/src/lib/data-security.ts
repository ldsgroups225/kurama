/**
 * Data Security and Privacy Utilities
 *
 * Implements security measures for cached data:
 * - Encryption for sensitive data
 * - Automatic data expiration
 * - Security checks for failed auth attempts
 * - Data clearing on logout
 */

import { getBrowserSecurityConfig } from '@kurama/config/security'
import { db } from './db'

/**
 * Security configuration
 */
const SECURITY_CONFIG = getBrowserSecurityConfig()

/**
 * Encrypt sensitive data using Web Crypto API
 * @param data - Data to encrypt
 * @param key - Encryption key (optional, generates if not provided)
 * @returns Encrypted data with IV
 */
export async function encryptData(
  data: string,
  key?: CryptoKey,
): Promise<{ encrypted: string, iv: string, key?: CryptoKey }> {
  // Generate key if not provided
  if (!key) {
    key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt data
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData,
  )

  // Convert to base64
  const encryptedArray = new Uint8Array(encryptedData)
  const encrypted = btoa(String.fromCharCode(...encryptedArray))
  const ivBase64 = btoa(String.fromCharCode(...iv))

  return {
    encrypted,
    iv: ivBase64,
    key,
  }
}

/**
 * Decrypt data using Web Crypto API
 * @param encrypted - Encrypted data (base64)
 * @param iv - Initialization vector (base64)
 * @param key - Decryption key
 * @returns Decrypted data
 */
export async function decryptData(
  encrypted: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  // Convert from base64
  const encryptedArray = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0))

  // Decrypt data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivArray,
    },
    key,
    encryptedArray,
  )

  // Convert to string
  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity(): Promise<void> {
  await db.appState.put({
    key: SECURITY_CONFIG.lastActivityKey,
    value: Date.now(),
  })
}

/**
 * Check if data has expired due to inactivity
 * @returns True if data has expired
 */
export async function hasDataExpired(): Promise<boolean> {
  const lastActivity = await db.appState.get(SECURITY_CONFIG.lastActivityKey)

  if (!lastActivity) {
    return false // No activity recorded yet
  }

  const lastActivityTime = lastActivity.value as number
  const now = Date.now()
  const daysSinceActivity = (now - lastActivityTime) / (1000 * 60 * 60 * 24)

  return daysSinceActivity > SECURITY_CONFIG.inactivityExpirationDays
}

/**
 * Clear all cached data
 * Should be called on logout or when data expires
 */
export async function clearAllCachedData(): Promise<void> {
  try {
    // Clear IndexedDB tables
    await db.queryCache.clear()
    await db.mutationQueue.clear()
    await db.authState.clear()
    await db.appState.clear()

    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName)),
      )
    }

    console.warn('[Data Security] All cached data cleared')
  }
  catch (error) {
    console.error('[Data Security] Failed to clear cached data:', error)
    throw error
  }
}

/**
 * Clear personal data only (keep app state)
 * Used for privacy-focused clearing
 */
export async function clearPersonalData(): Promise<void> {
  try {
    // Clear personal data from IndexedDB
    await db.queryCache.clear()
    await db.mutationQueue.clear()
    await db.authState.clear()

    // Keep app state (settings, preferences)
    // Only clear sensitive app state
    const sensitiveKeys = [
      SECURITY_CONFIG.lastActivityKey,
      SECURITY_CONFIG.failedAuthAttemptsKey,
    ]

    for (const key of sensitiveKeys) {
      await db.appState.delete(key)
    }

    console.warn('[Data Security] Personal data cleared')
  }
  catch (error) {
    console.error('[Data Security] Failed to clear personal data:', error)
    throw error
  }
}

/**
 * Record failed authentication attempt
 * @returns Number of failed attempts
 */
export async function recordFailedAuthAttempt(): Promise<number> {
  const attemptsRecord = await db.appState.get(SECURITY_CONFIG.failedAuthAttemptsKey)
  const currentAttempts = (attemptsRecord?.value as number) || 0
  const newAttempts = currentAttempts + 1

  await db.appState.put({
    key: SECURITY_CONFIG.failedAuthAttemptsKey,
    value: newAttempts,
  })

  // Check if max attempts exceeded
  if (newAttempts >= SECURITY_CONFIG.maxFailedAuthAttempts) {
    console.warn('[Data Security] Max failed auth attempts exceeded, clearing data')
    await clearAllCachedData()
  }

  return newAttempts
}

/**
 * Reset failed authentication attempts
 * Should be called on successful authentication
 */
export async function resetFailedAuthAttempts(): Promise<void> {
  await db.appState.delete(SECURITY_CONFIG.failedAuthAttemptsKey)
}

/**
 * Get number of failed authentication attempts
 * @returns Number of failed attempts
 */
export async function getFailedAuthAttempts(): Promise<number> {
  const attemptsRecord = await db.appState.get(SECURITY_CONFIG.failedAuthAttemptsKey)
  return (attemptsRecord?.value as number) || 0
}

/**
 * Check and enforce data expiration
 * Should be called on app startup
 */
export async function enforceDataExpiration(): Promise<void> {
  const expired = await hasDataExpired()

  if (expired) {
    console.warn('[Data Security] Data expired due to inactivity, clearing...')
    await clearAllCachedData()
  }
  else {
    // Update last activity
    await updateLastActivity()
  }
}

/**
 * Setup automatic activity tracking
 * Tracks user interactions to update last activity timestamp
 */
export function setupActivityTracking(): () => void {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  let lastUpdate = Date.now()
  const updateInterval = 60000 // Update every minute

  const handleActivity = () => {
    const now = Date.now()
    if (now - lastUpdate > updateInterval) {
      updateLastActivity()
      lastUpdate = now
    }
  }

  // Add event listeners
  events.forEach((event) => {
    window.addEventListener(event, handleActivity, { passive: true })
  })

  // Cleanup function
  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity)
    })
  }
}

/**
 * Check if biometric authentication is available
 * @returns True if biometric auth is available
 */
export async function isBiometricAuthAvailable(): Promise<boolean> {
  // Check for Web Authentication API
  if (!('credentials' in navigator)) {
    return false
  }

  // Check for PublicKeyCredential
  if (!window.PublicKeyCredential) {
    return false
  }

  // Check if platform authenticator is available
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    return available
  }
  catch {
    return false
  }
}

/**
 * Request biometric authentication
 * @returns True if authentication successful
 */
export async function requestBiometricAuth(): Promise<boolean> {
  if (!(await isBiometricAuthAvailable())) {
    return false
  }

  try {
    // Generate challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32))

    // Request authentication
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
      },
    }) as PublicKeyCredential | null

    return credential !== null
  }
  catch (error) {
    console.error('[Data Security] Biometric auth failed:', error)
    return false
  }
}

/**
 * Sanitize sensitive data from logs
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'authToken',
  ]

  const sanitized = { ...data }

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    }
    else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Initialize data security measures
 * Should be called on app startup
 */
export async function initializeDataSecurity(): Promise<void> {
  // Enforce data expiration
  await enforceDataExpiration()

  // Setup activity tracking
  const cleanup = setupActivityTracking()

    // Store cleanup function for later use
    ; (window as any).__dataSecurityCleanup = cleanup

  console.warn('[Data Security] Security measures initialized')
}

/**
 * Cleanup data security measures
 * Should be called on app shutdown or logout
 */
export function cleanupDataSecurity(): void {
  const cleanup = (window as any).__dataSecurityCleanup
  if (cleanup) {
    cleanup()
    delete (window as any).__dataSecurityCleanup
  }
}
