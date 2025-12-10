---
inclusion: fileMatch
fileMatchPattern: "**/*{pwa,offline,sw,service-worker,dexie}*.{ts,tsx}"
---

# PWA & Offline-First Guide

## Service Worker (Workbox)

### Configuration
```typescript
// sw.ts
import { precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies"

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 3,
  })
)

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)
```

## IndexedDB (Dexie)

### Database Setup
```typescript
import Dexie, { Table } from "dexie"

interface OfflineLesson {
  id: string
  title: string
  content: string
  syncedAt: Date
}

class KuramaDB extends Dexie {
  lessons!: Table<OfflineLesson>
  progress!: Table<OfflineProgress>

  constructor() {
    super("kurama-offline")
    this.version(1).stores({
      lessons: "id, title, syncedAt",
      progress: "id, lessonId, userId, syncedAt",
    })
  }
}

export const db = new KuramaDB()
```

### Offline Data Sync
```typescript
// Save for offline
async function saveForOffline(lesson: Lesson) {
  await db.lessons.put({
    ...lesson,
    syncedAt: new Date(),
  })
}

// Sync when online
async function syncOfflineData() {
  const unsyncedProgress = await db.progress
    .where("syncedAt")
    .equals(null)
    .toArray()
  
  for (const progress of unsyncedProgress) {
    await syncProgress(progress)
    await db.progress.update(progress.id, { syncedAt: new Date() })
  }
}
```

## Offline Hooks

### useOfflineStatus
```typescript
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  
  return isOnline
}
```

## Install Prompt
```typescript
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])
  
  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome
  }
  
  return { canInstall: !!deferredPrompt, install }
}
```

## Best Practices
- Cache critical assets for offline access
- Show offline indicator to users
- Queue actions when offline, sync when online
- Handle sync conflicts gracefully
- Test offline scenarios thoroughly
