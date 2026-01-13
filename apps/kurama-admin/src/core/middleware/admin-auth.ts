import { eq } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { userProfiles } from '@kurama/data-ops/drizzle/schema'
import { getAuth } from '@kurama/data-ops/auth/server'
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

async function getAuthContext() {
  const auth = getAuth()
  const req = getRequest()

  const session = await auth.api.getSession(req)
  if (!session) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  })

  if (!profile || profile.userType !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return {
    auth,
    userId: session.user.id,
    email: session.user.email,
    session,
    profile,
  }
}

export const adminMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})
