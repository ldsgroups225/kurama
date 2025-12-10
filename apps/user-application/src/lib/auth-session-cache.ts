/**
 * Auth session cache for preventing flash on reload
 * Stores minimal session state in localStorage for instant UI decisions
 */

const SESSION_CACHE_KEY = 'kurama:sessionCache'
const SESSION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days (matches Better Auth default)

export interface CachedSessionState {
  isAuthenticated: boolean
  userId: string | null
  timestamp: number
}

/**
 * Get cached session state from localStorage
 * Returns null if cache is expired or invalid
 */
export function getCachedSessionState(): CachedSessionState | null {
  if (typeof window === 'undefined')
    return null

  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY)
    if (!cached)
      return null

    const state: CachedSessionState = JSON.parse(cached)

    // Check if cache is expired
    if (Date.now() - state.timestamp > SESSION_CACHE_TTL) {
      clearCachedSessionState()
      return null
    }

    return state
  }
  catch {
    clearCachedSessionState()
    return null
  }
}

/**
 * Cache session state in localStorage
 */
export function setCachedSessionState(isAuthenticated: boolean, userId: string | null): void {
  if (typeof window === 'undefined')
    return

  try {
    const state: CachedSessionState = {
      isAuthenticated,
      userId,
      timestamp: Date.now(),
    }
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(state))
  }
  catch {
    // Silently fail - localStorage might be full or disabled
  }
}

/**
 * Clear cached session state
 */
export function clearCachedSessionState(): void {
  if (typeof window === 'undefined')
    return

  try {
    localStorage.removeItem(SESSION_CACHE_KEY)
  }
  catch {
    // Silently fail
  }
}

/**
 * Check if we have a cached authenticated session
 * Used for instant UI decisions before Better Auth verifies
 */
export function hasCachedAuthenticatedSession(): boolean {
  const cached = getCachedSessionState()
  return cached?.isAuthenticated === true
}
