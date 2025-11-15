/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import type { QueryClient } from '@tanstack/react-query'
/// <reference types="vite/client" />
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from '@tanstack/react-router'
import * as React from 'react'
import { DefaultCatchBoundary } from '@/components/default-catch-boundary'
import { NotFound } from '@/components/not-found'
import { ThemeProvider } from '@/components/theme'
import { initPerformanceMonitoring } from '@/lib/performance-monitor'
import { initPreloading } from '@/lib/preload'
import appCss from '@/styles.css?url'
import { seo } from '@/utils/seo'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'theme-color',
        content: '#f97316',
      },
      ...seo({
        title: 'Kurama - Votre compagnon d\'apprentissage intelligent',
        description:
          'Réussissez le BEPC et le BAC en Côte d\'Ivoire avec Kurama. Apprentissage personnalisé, révision intelligente et disponible hors ligne.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      // Resource hints for performance optimization
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://accounts.google.com' },
      { rel: 'dns-prefetch', href: 'https://api.polar.sh' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()

  // Initialize performance monitoring on mount
  React.useEffect(() => {
    initPerformanceMonitoring()
  }, [])

  // Initialize intelligent preloading based on current route
  React.useEffect(() => {
    const cleanup = initPreloading(location.pathname)
    return cleanup
  }, [location.pathname])

  return (
    <RootDocument>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  )
}

/**
 * Critical inline script to prevent FOUC (Flash of Unstyled Content).
 * This must run before page render to apply the correct theme.
 * Content is static and controlled - no user input or external data.
 */
function ThemeScript() {
  return (

    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('ui-theme') || 'system';
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var resolvedTheme = theme === 'system' ? systemTheme : theme;
              
              if (resolvedTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && <DevTools />}
        <Scripts />
      </body>
    </html>
  )
}

/**
 * Lazy load devtools to avoid including them in the main bundle
 */
const LazyDevTools = React.lazy(() =>
  Promise.all([
    import('@tanstack/react-router-devtools').then(m => ({
      RouterDevtools: m.TanStackRouterDevtools,
    })),
    import('@tanstack/react-query-devtools').then(m => ({
      QueryDevtools: m.ReactQueryDevtools,
    })),
  ]).then(([router, query]) => ({
    default: () => (
      <>
        <router.RouterDevtools position="bottom-right" />
        <query.QueryDevtools buttonPosition="bottom-left" />
      </>
    ),
  })),
)

/**
 * Lazy-loaded devtools component
 * Only loaded in development mode
 */
function DevTools() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Use a microtask to defer the state update
    queueMicrotask(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted)
    return null

  return (
    <React.Suspense fallback={null}>
      <LazyDevTools />
    </React.Suspense>
  )
}
