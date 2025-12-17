import { configure, getLogger, type LogRecord } from '@logtape/logtape'
import { createSentrySink } from './sinks/sentry-sink'
import { createConsoleSink } from './sinks/console-sink'

export interface LogTapeConfig {
  level: 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'fatal'
  environment: string
  sentryDsn?: string
  enableConsole?: boolean
}

export async function setupLogging(config: LogTapeConfig) {
  const sinks: Record<string, (record: LogRecord) => void> = {}
  const loggerSinks: string[] = []

  // Console sink (always in dev, optional in prod)
  if (config.environment === 'development' || config.enableConsole) {
    sinks.console = createConsoleSink()
    loggerSinks.push('console')
  }

  // Sentry sink (production only)
  if (config.sentryDsn && config.environment === 'production') {
    const { captureException } = await import('@sentry/browser')
    sinks.sentry = createSentrySink(captureException)
    loggerSinks.push('sentry')
  }

  // Meta logger sink (for LogTape internal errors)
  sinks.meta = (record: LogRecord) => {
    console.error('[LogTape Meta]', record.level.toUpperCase(), record.message)
  }

  await configure({
    sinks,
    loggers: [
      {
        category: ['kurama'],
        sinks: loggerSinks,
        lowestLevel: config.level,
      },
      // Configure meta logger with dedicated sink
      {
        category: ['logtape', 'meta'],
        sinks: ['meta'],
        lowestLevel: 'error', // Only log errors and above to reduce noise
      },
    ],
  })
}

// Logger factory
export function createLogger(category: string) {
  return getLogger(['kurama', category])
}

export { getLogger }
