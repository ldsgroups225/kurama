/**
 * Polar Webhook Handler
 *
 * Handles incoming webhooks from Polar for subscription and order events.
 * Uses the @polar-sh/hono adapter for webhook validation.
 */

import { Webhooks } from '@polar-sh/hono'
import { Hono } from 'hono'
import { handleWebhookEvent } from './handlers'

// Extended Env type for webhook handler
interface WebhookEnv {
  POLAR_WEBHOOK_SECRET: string
  POLAR_ACCESS_TOKEN: string
  POLAR_ORGANIZATION_ID: string
  DATABASE_HOST: string
  DATABASE_USERNAME: string
  DATABASE_PASSWORD: string
}

export const polarWebhooks = new Hono<{ Bindings: WebhookEnv }>()

// Polar webhook endpoint using the official adapter
polarWebhooks.post('/api/webhooks/polar', async (c) => {
  const webhookSecret = c.env.POLAR_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('POLAR_WEBHOOK_SECRET not configured')
    return c.json({ error: 'Webhook secret not configured' }, 500)
  }

  // Initialize database connection
  const dbConfig = {
    host: c.env.DATABASE_HOST,
    username: c.env.DATABASE_USERNAME,
    password: c.env.DATABASE_PASSWORD,
  }

  // Polar API config for creating discounts
  const polarConfig = c.env.POLAR_ACCESS_TOKEN && c.env.POLAR_ORGANIZATION_ID
    ? {
        accessToken: c.env.POLAR_ACCESS_TOKEN,
        organizationId: c.env.POLAR_ORGANIZATION_ID,
      }
    : undefined

  // Use the Polar Webhooks adapter
  const handler = Webhooks({
    webhookSecret,
    onPayload: async (payload) => {
      try {
        await handleWebhookEvent(payload, dbConfig, polarConfig)
      }
      catch (error) {
        console.error('Error processing webhook payload:', error)
        throw error
      }
    },
  })

  // Execute the webhook handler
  return handler(c)
})

// Health check endpoint for webhooks
polarWebhooks.get('/api/webhooks/polar/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'polar-webhooks',
    timestamp: new Date().toISOString(),
  })
})
