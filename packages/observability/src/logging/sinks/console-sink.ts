import type { LogRecord } from '@logtape/logtape'

// Pretty console sink for development
export function createConsoleSink() {
  const levelColors: Record<string, string> = {
    trace: '\x1b[90m',   // gray
    debug: '\x1b[36m',   // cyan
    info: '\x1b[32m',    // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    fatal: '\x1b[35m',   // magenta
  }
  const reset = '\x1b[0m'

  return (record: LogRecord) => {
    const color = levelColors[record.level] || ''
    const timestamp = new Date().toISOString()
    const category = record.category.join('.')
    const message = record.message.join(' ')

    console.log(
      `${color}[${timestamp}] [${record.level.toUpperCase()}] [${category}]${reset} ${message}`,
      record.properties || ''
    )
  }
}
