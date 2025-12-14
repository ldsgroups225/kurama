import type { LogRecord } from '@logtape/logtape'

// Custom Sentry sink for LogTape
export function createSentrySink(captureException: (error: Error) => void) {
  return (record: LogRecord) => {
    if (record.level === 'error' || record.level === 'fatal') {
      const error = record.properties?.error instanceof Error
        ? record.properties.error
        : new Error(record.message.join(' '))

      captureException(error)
    }
  }
}
