export type Environment = 'development' | 'staging' | 'production'

export interface EnvironmentConfig {
  environment: Environment
  isDevelopment: boolean
  isProduction: boolean
  isStaging: boolean
  sentryDsn: string | undefined
  apiUrl: string
  frontendUrl: string
}

// For Cloudflare Workers
export function getWorkerEnvironment(env: Record<string, string | undefined>): EnvironmentConfig {
  const environment = (env.ENVIRONMENT || 'development') as Environment

  return {
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isStaging: environment === 'staging',
    sentryDsn: env.SENTRY_DSN,
    apiUrl: env.API_URL || 'https://back-kurama.yeko.workers.dev',
    frontendUrl: env.FRONTEND_URL || 'https://kurama.yeko.workers.dev',
  }
}

// For Browser (TanStack Start)
export function getBrowserEnvironment(): EnvironmentConfig {
  const environment = (import.meta.env.MODE || 'development') as Environment

  return {
    environment,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isStaging: environment === 'staging',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    apiUrl: import.meta.env.VITE_API_URL || 'https://back-kurama.yeko.workers.dev',
    frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'https://kurama.yeko.workers.dev',
  }
}
