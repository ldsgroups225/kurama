/**
 * Feature Detection Utilities
 *
 * Detects browser capabilities for progressive enhancement
 */

export interface BrowserCapabilities {
  /** Service Worker API support */
  serviceWorker: boolean
  /** IndexedDB support */
  indexedDB: boolean
  /** Background Sync API support */
  backgroundSync: boolean
  /** Cache API support */
  cacheAPI: boolean
  /** Storage API (quota management) support */
  storageAPI: boolean
  /** Push API support */
  pushAPI: boolean
  /** Notification API support */
  notificationAPI: boolean
  /** Web Crypto API support */
  webCrypto: boolean
  /** Estimated storage quota in bytes (0 if unavailable) */
  estimatedQuota: number
  /** Device performance tier (high, medium, low) */
  performanceTier: 'high' | 'medium' | 'low'
}

/**
 * Detect all browser capabilities
 * @returns Object with capability flags
 */
export async function detectCapabilities(): Promise<BrowserCapabilities> {
  const capabilities: BrowserCapabilities = {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    backgroundSync: false,
    cacheAPI: 'caches' in window,
    storageAPI: 'storage' in navigator && 'estimate' in navigator.storage,
    pushAPI: 'PushManager' in window,
    notificationAPI: 'Notification' in window,
    webCrypto: 'crypto' in window && 'subtle' in window.crypto,
    estimatedQuota: 0,
    performanceTier: 'medium',
  }

  // Check Background Sync API
  if (capabilities.serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready
      capabilities.backgroundSync = 'sync' in registration
    }
    catch {
      capabilities.backgroundSync = false
    }
  }

  // Estimate storage quota
  if (capabilities.storageAPI) {
    try {
      const estimate = await navigator.storage.estimate()
      capabilities.estimatedQuota = estimate.quota || 0
    }
    catch {
      capabilities.estimatedQuota = 0
    }
  }

  // Detect performance tier
  capabilities.performanceTier = detectPerformanceTier()

  return capabilities
}

/**
 * Detect device performance tier based on hardware concurrency and memory
 * @returns Performance tier (high, medium, low)
 */
function detectPerformanceTier(): 'high' | 'medium' | 'low' {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4 // Default to 4GB

  // High-end: 6+ cores or 8+ GB RAM
  if (cores >= 6 || memory >= 8) {
    return 'high'
  }

  // Low-end: 2 cores or less, 2GB RAM or less
  if (cores <= 2 && memory <= 2) {
    return 'low'
  }

  // Medium-end: everything else
  return 'medium'
}

/**
 * Check if service worker is supported
 * @returns True if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator
}

/**
 * Check if IndexedDB is supported
 * @returns True if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window
}

/**
 * Check if Background Sync API is supported
 * @returns Promise that resolves to true if supported
 */
export async function isBackgroundSyncSupported(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return 'sync' in registration
  }
  catch {
    return false
  }
}

/**
 * Check if device has low storage
 * @returns Promise that resolves to true if storage is low
 */
export async function isLowStorage(): Promise<boolean> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return false
  }

  try {
    const estimate = await navigator.storage.estimate()
    const quota = estimate.quota || 0
    const usage = estimate.usage || 0

    // Consider low storage if less than 100MB available
    const available = quota - usage
    return available < 100 * 1024 * 1024
  }
  catch {
    return false
  }
}

/**
 * Get recommended cache limits based on device capabilities
 * @param capabilities - Browser capabilities
 * @returns Recommended cache limits
 */
export function getRecommendedCacheLimits(capabilities: BrowserCapabilities): {
  maxCacheSize: number
  maxEntries: number
  maxAge: number
} {
  const { performanceTier, estimatedQuota } = capabilities

  // Base limits for medium-tier devices
  let maxCacheSize = 50 * 1024 * 1024 // 50MB
  let maxEntries = 100
  let maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

  // Adjust for performance tier
  if (performanceTier === 'high') {
    maxCacheSize = 100 * 1024 * 1024 // 100MB
    maxEntries = 200
    maxAge = 14 * 24 * 60 * 60 * 1000 // 14 days
  }
  else if (performanceTier === 'low') {
    maxCacheSize = 25 * 1024 * 1024 // 25MB
    maxEntries = 50
    maxAge = 3 * 24 * 60 * 60 * 1000 // 3 days
  }

  // Adjust based on available quota (use max 10% of quota)
  if (estimatedQuota > 0) {
    const recommendedSize = Math.min(maxCacheSize, estimatedQuota * 0.1)
    maxCacheSize = recommendedSize
  }

  return {
    maxCacheSize,
    maxEntries,
    maxAge,
  }
}

/**
 * Check if animations should be disabled based on device capabilities
 * @param capabilities - Browser capabilities
 * @returns True if animations should be disabled
 */
export function shouldDisableAnimations(capabilities: BrowserCapabilities): boolean {
  // Disable animations on low-end devices
  if (capabilities.performanceTier === 'low') {
    return true
  }

  // Check user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }

  return false
}

/**
 * Get fallback storage mechanism when IndexedDB is unavailable
 * @returns Storage mechanism ('indexedDB', 'localStorage', 'sessionStorage', 'memory')
 */
export function getFallbackStorage(): 'indexedDB' | 'localStorage' | 'sessionStorage' | 'memory' {
  if (isIndexedDBSupported()) {
    return 'indexedDB'
  }

  // Try localStorage
  try {
    localStorage.setItem('__test__', 'test')
    localStorage.removeItem('__test__')
    return 'localStorage'
  }
  catch {
    // localStorage not available or quota exceeded
  }

  // Try sessionStorage
  try {
    sessionStorage.setItem('__test__', 'test')
    sessionStorage.removeItem('__test__')
    return 'sessionStorage'
  }
  catch {
    // sessionStorage not available
  }

  // Fallback to in-memory storage
  return 'memory'
}

/**
 * Display warning message for unsupported features
 * @param feature - Feature name
 * @param message - Warning message
 */
export function displayFeatureWarning(feature: string, message: string): void {
  console.warn(`[Feature Detection] ${feature}: ${message}`)

  // You can also display a toast notification here
  // toast.warning(message)
}

/**
 * Initialize progressive enhancement based on capabilities
 * @returns Promise that resolves to capabilities
 */
export async function initializeProgressiveEnhancement(): Promise<BrowserCapabilities> {
  const capabilities = await detectCapabilities()

  // Log capabilities in development
  if (import.meta.env.DEV) {
    console.warn('[Progressive Enhancement] Browser capabilities:', capabilities)
  }

  // Display warnings for missing critical features
  if (!capabilities.serviceWorker) {
    displayFeatureWarning(
      'Service Worker',
      'Offline functionality is not available in this browser. The app will work in online-only mode.',
    )
  }

  if (!capabilities.indexedDB) {
    displayFeatureWarning(
      'IndexedDB',
      'Local data storage is limited. Some features may not work as expected.',
    )
  }

  if (!capabilities.backgroundSync) {
    displayFeatureWarning(
      'Background Sync',
      'Automatic background synchronization is not available. Data will sync when you open the app.',
    )
  }

  // Adjust cache limits for low-storage devices
  if (capabilities.estimatedQuota > 0 && capabilities.estimatedQuota < 100 * 1024 * 1024) {
    displayFeatureWarning(
      'Storage',
      'Device storage is low. Cache limits have been reduced.',
    )
  }

  return capabilities
}
