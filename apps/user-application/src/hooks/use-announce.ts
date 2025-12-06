import { useCallback, useEffect, useRef } from 'react'

/**
 * Hook for announcing messages to screen readers
 * Uses ARIA live regions for accessibility
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('role', 'status')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `
      document.body.appendChild(announcer)
      announcerRef.current = announcer
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current)
        announcerRef.current = null
      }
    }
  }, [])

  const announce = useCallback((message: string) => {
    if (announcerRef.current) {
      // Clear and set message to trigger announcement
      announcerRef.current.textContent = ''
      // Use setTimeout to ensure the change is detected
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message
        }
      }, 100)
    }
  }, [])

  return { announce }
}

/**
 * Announce stat changes for accessibility
 */
export function announceStatChange(type: 'xp' | 'level' | 'streak' | 'achievement', value: string | number) {
  const messages: Record<string, string> = {
    xp: `Vous avez gagné ${value} points d'expérience`,
    level: `Félicitations ! Vous avez atteint le niveau ${value}`,
    streak: `Votre série est maintenant de ${value} jours`,
    achievement: `Nouveau badge débloqué : ${value}`,
  }

  const message = messages[type]
  if (message) {
    // Create a temporary announcer for immediate feedback
    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'alert')
    announcer.setAttribute('aria-live', 'assertive')
    announcer.className = 'sr-only'
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    announcer.textContent = message
    document.body.appendChild(announcer)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }
}
