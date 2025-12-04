import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware/admin-auth'

export const checkAuth = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    return { user: context.session.user }
  })
