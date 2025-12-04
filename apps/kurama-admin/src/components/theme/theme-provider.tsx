import * as React from 'react'
import { ThemeProviderContext } from './theme-context'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'admin-ui-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }
    try {
      const stored = localStorage.getItem(storageKey) as Theme
      return stored || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark' | undefined>(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [isMounted, setIsMounted] = React.useState(false)

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // Ignore localStorage errors
      }
      setThemeState(newTheme)
    },
    [storageKey],
  )

  const applyTheme = React.useCallback(
    (targetTheme: 'light' | 'dark' | undefined) => {
      if (!targetTheme || typeof document === 'undefined') return

      const root = document.documentElement

      if (disableTransitionOnChange) {
        const css = document.createElement('style')
        css.appendChild(
          document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
          ),
        )
        document.head.appendChild(css)
          ; (() => window.getComputedStyle(document.body))()
        setTimeout(() => {
          document.head.removeChild(css)
        }, 1)
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark')
        root.classList.add(targetTheme)
      } else {
        root.setAttribute(attribute, targetTheme)
      }
    },
    [attribute, disableTransitionOnChange],
  )

  React.useEffect(() => {
    if (isMounted) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, applyTheme, isMounted])

  React.useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [enableSystem])

  React.useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true)
    })
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, applyTheme, isMounted])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme: isMounted ? resolvedTheme : undefined,
      systemTheme: isMounted ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, systemTheme, isMounted],
  )

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  )
}
