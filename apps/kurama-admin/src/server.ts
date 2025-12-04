import { setAuth } from '@kurama/data-ops/auth/server'
import { initDatabase } from '@kurama/data-ops/database/setup'
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'

console.warn('[server-entry]: using custom server entry for kurama-admin')

export default {
  fetch(request: Request) {
    const db = initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    })

    setAuth({
      secret: env.BETTER_AUTH_SECRET,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      adapter: {
        drizzleDb: db,
        provider: 'pg',
      },
    })

    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    })
  },
}
