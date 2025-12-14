import { getWorkerEnvironment } from '@kurama/config/environment'
import { createLogger } from '@kurama/observability/logging'
import {
  sentryErrorHandler,
  sentryMiddleware,
} from '@kurama/observability/sentry/cloudflare'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { polarWebhooks } from './webhooks'

// Extended Env type for the app
interface AppEnv {
  SENTRY_DSN?: string
  POLAR_WEBHOOK_SECRET: string
  DATABASE_HOST: string
  DATABASE_USERNAME: string
  DATABASE_PASSWORD: string
  CORS_ORIGIN?: string
  API_VERSION?: string
  ENVIRONMENT?: string
}

export const app = new Hono<{ Bindings: AppEnv }>()

const logger = createLogger('api')

// Sentry middleware (first!)
app.use('*', sentryMiddleware(env => ({
  dsn: env.SENTRY_DSN || '',
  environment: env.ENVIRONMENT || 'development',
  release: `kurama-backend@${env.API_VERSION || 'v1'}`,
  tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
})))

// Request logging
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  logger.info(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`)
})

// CORS
app.use('/api/*', cors({
  origin: (origin, c) => {
    const env = getWorkerEnvironment(c.env)
    return origin === env.frontendUrl ? origin : env.frontendUrl
  },
  credentials: true,
}))

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'kurama-backend',
    version: c.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
  })
})

// API health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'kurama-backend',
    environment: c.env.ENVIRONMENT || 'development',
  })
})

// Mount webhook routes
app.route('/', polarWebhooks)

// Error handling with Sentry
app.onError(sentryErrorHandler)

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})
