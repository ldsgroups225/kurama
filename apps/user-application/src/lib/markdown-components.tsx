import type { Components } from 'react-markdown'

/**
 * Custom markdown components for consistent styling
 */
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-4 text-3xl font-bold">
      {' '}
      {children}
      {' '}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-3 text-2xl font-semibold">
      {' '}
      {children}
      {' '}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-xl font-semibold">
      {' '}
      {children}
      {' '}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed">
      {' '}
      {children}
      {' '}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6">
      {' '}
      {children}
      {' '}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6">
      {' '}
      {children}
      {' '}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">
      {' '}
      {children}
      {' '}
    </li>
  ),
  code: ({ inline, children, ...props }: any) =>
    inline
      ? (
          <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
            {children}
          </code>
        )
      : (
          <code
            className={`
              block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm
            `}
            {...props}
          >
            {children}
          </code>
        ),
  pre: ({ children }) => (
    <pre className="mb-4">
      {' '}
      {children}
      {' '}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className={`
      my-4 border-l-4 border-primary pl-4 text-muted-foreground italic
    `}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className={`
        text-primary
        hover:underline
      `}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
}
