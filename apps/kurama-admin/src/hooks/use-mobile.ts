import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return undefined
}

export function useIsMobile() {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return !!isMobile
}
