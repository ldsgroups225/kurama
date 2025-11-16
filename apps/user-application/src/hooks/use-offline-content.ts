import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { db } from '@/lib/db'

export interface OfflineContentItem {
  id: string
  type: 'subject' | 'lesson' | 'flashcard'
  title: string
  size: number // in bytes
  downloadedAt: number
  lastAccessedAt: number
}

export interface DownloadProgress {
  contentId: string
  progress: number // 0-100
  status: 'idle' | 'downloading' | 'completed' | 'error'
  error?: string
}

/**
 * Hook for managing offline content downloads and caching
 */
export function useOfflineContent() {
  const [pinnedContent, setPinnedContent] = useState<OfflineContentItem[]>([])
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(() => new Map())
  const [isOnCellular, setIsOnCellular] = useState(false)
  const { toast } = useToast()

  // Check if user is on cellular connection
  useEffect(() => {
    const checkCellularConnection = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        return conn?.type === 'cellular' || conn?.effectiveType === '2g' || conn?.effectiveType === '3g'
      }
      return false
    }

    // Set initial connection status using setTimeout to defer the state update
    const initialStatus = checkCellularConnection()
    const timeoutId = setTimeout(() => setIsOnCellular(initialStatus), 0)

    // Set up change listener
    const handleConnectionChange = () => {
      setIsOnCellular(checkCellularConnection())
    }

    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      conn?.addEventListener('change', handleConnectionChange)
      return () => {
        clearTimeout(timeoutId)
        conn?.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  // Load pinned content from Dexie
  useEffect(() => {
    const loadPinnedContent = async () => {
      try {
        const stored = await db.appState.get('pinnedContent')
        if (stored?.value) {
          setPinnedContent(stored.value as OfflineContentItem[])
        }
      }
      catch (error) {
        console.error('Failed to load pinned content:', error)
      }
    }

    loadPinnedContent()
  }, [])

  /**
   * Download content for offline access
   */
  const downloadForOffline = useCallback(async (
    contentId: string,
    contentType: 'subject' | 'lesson' | 'flashcard',
    title: string,
    fetchUrls: string[],
  ): Promise<boolean> => {
    // Warn if on cellular
    if (isOnCellular) {
      toast({
        title: 'Avertissement',
        description: 'Vous êtes sur une connexion cellulaire. Le téléchargement peut consommer vos données mobiles.',
        variant: 'default',
      })
      // Continue with download but user is aware
    }

    // Initialize progress
    setDownloadProgress(prev => new Map(prev).set(contentId, {
      contentId,
      progress: 0,
      status: 'downloading',
    }))

    try {
      let totalSize = 0
      let downloadedSize = 0

      // Fetch all URLs and cache them
      for (let i = 0; i < fetchUrls.length; i++) {
        const url = fetchUrls[i]

        // Skip invalid URLs
        if (!url) {
          console.warn('[useOfflineContent] Skipping invalid URL at index', i)
          continue
        }

        try {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`)
          }

          // Get content length if available
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            totalSize += Number.parseInt(contentLength, 10)
          }

          // Clone response for caching
          const responseClone = response.clone()

          // Cache the response
          const cache = await caches.open('offline-content')
          await cache.put(url, responseClone)

          // Get actual size from blob
          const blob = await response.blob()
          downloadedSize += blob.size

          // Update progress
          const progress = Math.round(((i + 1) / fetchUrls.length) * 100)
          setDownloadProgress(prev => new Map(prev).set(contentId, {
            contentId,
            progress,
            status: 'downloading',
          }))
        }
        catch (error) {
          console.error(`Failed to cache ${url}:`, error)
          // Continue with other URLs
        }
      }

      // Store in pinned content list
      const newItem: OfflineContentItem = {
        id: contentId,
        type: contentType,
        title,
        size: downloadedSize || totalSize,
        downloadedAt: Date.now(),
        lastAccessedAt: Date.now(),
      }

      const updatedContent = [...pinnedContent, newItem]
      setPinnedContent(updatedContent)

      // Save to Dexie
      await db.appState.put({
        key: 'pinnedContent',
        value: updatedContent,
      })

      // Mark as completed
      setDownloadProgress(prev => new Map(prev).set(contentId, {
        contentId,
        progress: 100,
        status: 'completed',
      }))

      return true
    }
    catch (error) {
      console.error('Download failed:', error)
      setDownloadProgress(prev => new Map(prev).set(contentId, {
        contentId,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed',
      }))
      return false
    }
  }, [isOnCellular, pinnedContent, toast])

  /**
   * Remove content from offline storage
   */
  const removeOfflineContent = useCallback(async (contentId: string): Promise<boolean> => {
    try {
      // Remove from pinned content list
      const updatedContent = pinnedContent.filter(item => item.id !== contentId)
      setPinnedContent(updatedContent)

      // Update Dexie
      await db.appState.put({
        key: 'pinnedContent',
        value: updatedContent,
      })

      // Note: We don't remove from cache here as other content might reference the same URLs
      // Cache eviction will handle cleanup based on LRU

      return true
    }
    catch (error) {
      console.error('Failed to remove offline content:', error)
      return false
    }
  }, [pinnedContent])

  /**
   * Check if content is available offline
   */
  const isContentOffline = useCallback((contentId: string): boolean => {
    return pinnedContent.some(item => item.id === contentId)
  }, [pinnedContent])

  /**
   * Update last accessed time for content
   */
  const updateLastAccessed = useCallback(async (contentId: string): Promise<void> => {
    const updatedContent = pinnedContent.map(item =>
      item.id === contentId
        ? { ...item, lastAccessedAt: Date.now() }
        : item,
    )
    setPinnedContent(updatedContent)

    await db.appState.put({
      key: 'pinnedContent',
      value: updatedContent,
    })
  }, [pinnedContent])

  return {
    pinnedContent,
    downloadProgress,
    isOnCellular,
    downloadForOffline,
    removeOfflineContent,
    isContentOffline,
    updateLastAccessed,
  }
}
