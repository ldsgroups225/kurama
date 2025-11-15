import { lazy } from 'react'

// Lazy load react-markdown
export const ReactMarkdown = lazy(() =>
  import('react-markdown').then(mod => ({ default: mod.default })),
)
