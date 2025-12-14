/**
 * Security configuration with environment variable overrides
 * 
 * Environment Variables:
 * - SECURITY_INACTIVITY_DAYS: Days before data expiration (default: 7)
 * - SECURITY_MAX_AUTH_ATTEMPTS: Max failed auth attempts (default: 5)
 * - SECURITY_SESSION_TIMEOUT_HOURS: Session timeout in hours (default: 24)
 */
export interface SecurityConfig {
  /** Days of inactivity before data expiration */
  inactivityExpirationDays: number
  /** Maximum failed auth attempts before clearing data */
  maxFailedAuthAttempts: number
  /** Session timeout in hours */
  sessionTimeoutHours: number
  /** Key for storing last activity timestamp */
  lastActivityKey: string
  /** Key for storing failed auth attempts */
  failedAuthAttemptsKey: string
}

export function getSecurityConfig(env?: Record<string, string | undefined>): SecurityConfig {
  return {
    inactivityExpirationDays: Number(env?.SECURITY_INACTIVITY_DAYS) || 7,
    maxFailedAuthAttempts: Number(env?.SECURITY_MAX_AUTH_ATTEMPTS) || 5,
    sessionTimeoutHours: Number(env?.SECURITY_SESSION_TIMEOUT_HOURS) || 24,
    lastActivityKey: 'last_activity_timestamp',
    failedAuthAttemptsKey: 'failed_auth_attempts',
  }
}

// For browser usage (reads from import.meta.env)
export function getBrowserSecurityConfig(): SecurityConfig {
  return getSecurityConfig({
    SECURITY_INACTIVITY_DAYS: import.meta.env.VITE_SECURITY_INACTIVITY_DAYS,
    SECURITY_MAX_AUTH_ATTEMPTS: import.meta.env.VITE_SECURITY_MAX_AUTH_ATTEMPTS,
    SECURITY_SESSION_TIMEOUT_HOURS: import.meta.env.VITE_SECURITY_SESSION_TIMEOUT_HOURS,
  })
}
