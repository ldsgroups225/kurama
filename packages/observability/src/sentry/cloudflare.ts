import { Toucan, rewriteFramesIntegration } from 'toucan-js'
import type { Context, ExecutionContext } from 'hono'

export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate?: number
  sendDefaultPii?: boolean
}

export function createSentryClient(
  request: Request,
  ctx: ExecutionContext,
  config: SentryConfig
): Toucan {
  return new Toucan({
    dsn: config.dsn,
    context: ctx,
    request,
    environment: config.environment,
    release: config.release,
    sendDefaultPii: config.sendDefaultPii ?? false,
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    integrations: [rewriteFramesIntegration({ root: '/' })],
  })
}

// Hono middleware
export function sentryMiddleware(getConfig: (env: any) => SentryConfig) {
  return async (c: Context, next: () => Promise<void>) => {
    const config = getConfig(c.env)

    if (!config.dsn) {
      // Skip Sentry in development without DSN
      return next()
    }

    let sentry: Toucan | undefined
    try {
      sentry = createSentryClient(c.req.raw, c.executionCtx, config)
      c.set('sentry', sentry)
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error)
      // Continue without Sentry if initialization fails
    }

    try {
      await next()
    } catch (error) {
      if (sentry) {
        sentry.captureException(error)
      }
      throw error
    }
  }
}

// Error handler for Hono
export function sentryErrorHandler(error: Error, c: Context) {
  const sentry = c.get('sentry') as Toucan | undefined

  if (sentry) {
    try {
      sentry.setExtra('url', c.req.url)
      sentry.setExtra('method', c.req.method)
      sentry.setExtra('headers', Object.fromEntries(c.req.raw.headers))
      sentry.captureException(error)
    } catch (captureError) {
      console.error('[Sentry] Failed to capture exception:', captureError)
    }
  }

  console.error('[Sentry] Captured exception:', error.message)

  return c.json({
    error: 'Internal Server Error',
    message: error.message,
    // Include event ID for support reference if available
    eventId: sentry?.lastEventId?.() ?? null,
  }, 500)
}
