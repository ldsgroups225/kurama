/**
 * Lazy Loading for PWA Components
 *
 * Code-split PWA features to reduce initial bundle size
 * Components are loaded on-demand when needed
 */

import { lazy } from 'react'

/**
 * Lazy load cache management component
 * Only loaded when user opens settings/cache management
 */
export const CacheManagementLazy = lazy(() =>
  import('./cache-management').then(module => ({
    default: module.CacheManagement,
  })),
)

/**
 * Lazy load conflict resolution dialog
 * Only loaded when conflicts are detected
 */
export const ConflictResolutionDialogLazy = lazy(() =>
  import('./conflict-resolution').then(module => ({
    default: module.ConflictResolutionDialog,
  })),
)

/**
 * Lazy load debug panel
 * Only loaded in development mode
 */
export const DebugPanelLazy = lazy(() =>
  import('./debug-panel').then(module => ({
    default: module.DebugPanel,
  })),
)

/**
 * Lazy load sync dashboard
 * Only loaded when user opens sync status
 */
export const SyncDashboardLazy = lazy(() =>
  import('./sync-dashboard').then(module => ({
    default: module.SyncDashboard,
  })),
)

/**
 * Lazy load offline content button
 * Only loaded when content is available for offline download
 */
export const OfflineContentButtonLazy = lazy(() =>
  import('./offline-content-button').then(module => ({
    default: module.OfflineContentButton,
  })),
)

// Export eager-loaded components (critical for UX)
export { InstallPrompt } from './install-prompt'
export { OfflineBanner } from './offline-banner'
export { OnlineStatusIndicator } from './online-status-indicator'
export { SyncStatus } from './sync-status'
export { UpdatePrompt } from './update-prompt'
