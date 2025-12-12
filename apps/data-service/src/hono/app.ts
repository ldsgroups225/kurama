import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { polarWebhooks } from './webhooks'

// Extended Env type for the app
interface AppEnv extends Env {
  POLAR_WEBHOOK_SECRET: string;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  CORS_ORIGIN?: string;
}

export const app = new Hono<{ Bindings: AppEnv }>()

// Middleware
app.use('*', logger())
app.use('/api/*', cors({
  origin: (origin, c) => {
    const allowedOrigin = c.env.CORS_ORIGIN || 'https://kurama.yeko.workers.dev';
    return origin === allowedOrigin ? origin : allowedOrigin;
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

// Error handling
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})
