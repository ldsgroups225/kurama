import { initDatabase, getDb } from '@kurama/data-ops/database/setup'

// Initialize database with environment variables
export function initAdminDb() {
  const host = process.env.DATABASE_HOST
  const username = process.env.DATABASE_USERNAME
  const password = process.env.DATABASE_PASSWORD

  if (!host || !username || !password) {
    throw new Error('Database environment variables not configured')
  }

  return initDatabase({ host, username, password })
}

export { getDb }
