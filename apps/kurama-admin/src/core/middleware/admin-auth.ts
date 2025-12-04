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

  // TODO: Add admin role check here when schema is ready
  // const adminRole = await db.query.adminRoles.findFirst(...)

  return {
    auth,
    userId: session.user.id,
    email: session.user.email,
    session,
  }
}

export const adminMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})
