import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
  content: string
  className?: string
  /** Compact mode for flashcards - reduces spacing and font sizes */
  compact?: boolean
  /** Center text content - useful for flashcard faces */
  centered?: boolean
}

/**
 * Renders markdown content with KaTeX math support.
 *
 * Math syntax:
 * - Inline math: $E=mc^2$ or \(E=mc^2\)
 * - Block math: $$ax^2 + bx + c = 0$$ or \[ax^2 + bx + c = 0\]
 *
 * Also supports GitHub-flavored markdown (tables, strikethrough, etc.)
 */
export function MarkdownRenderer({
  content,
  className = '',
  compact = false,
  centered = false,
}: MarkdownRendererProps) {
  return (
    <div className={cn(
      'prose prose-slate dark:prose-invert max-w-none',
      compact && 'prose-sm',
      centered && 'text-center',
      className,
    )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className={cn(
              'font-bold text-foreground',
              compact ? 'text-xl mt-3 mb-2' : 'text-2xl mt-6 mb-4',
            )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              'font-semibold text-foreground',
              compact ? 'text-lg mt-2 mb-1' : 'text-xl mt-5 mb-3',
            )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              'font-semibold text-foreground',
              compact ? 'text-base mt-2 mb-1' : 'text-lg mt-4 mb-2',
            )}
            >
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className={cn(
              'list-disc pl-6 space-y-1',
              compact ? 'my-2' : 'my-3',
              centered && 'text-left inline-block',
            )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(
              'list-decimal pl-6 space-y-1',
              compact ? 'my-2' : 'my-3',
              centered && 'text-left inline-block',
            )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground">{children}</li>
          ),
          p: ({ children }) => (
            <p className={cn(
              'text-muted-foreground leading-relaxed',
              compact ? 'my-1' : 'my-2',
            )}
            >
              {children}
            </p>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isCodeBlock = /language-\w+/.test(codeClassName || '')
            return !isCodeBlock
              ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                )
              : (
                  <code
                    className={cn(
                      'block bg-muted rounded-lg overflow-x-auto text-sm font-mono',
                      compact ? 'p-2' : 'p-4',
                      codeClassName,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                )
          },
          blockquote: ({ children }) => (
            <blockquote className={cn(
              'border-l-4 border-primary/50 pl-4 italic text-muted-foreground',
              compact ? 'my-2' : 'my-4',
            )}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className={cn('overflow-x-auto', compact ? 'my-2' : 'my-4')}>
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={cn(
              'border border-border bg-muted text-left font-semibold',
              compact ? 'px-2 py-1 text-sm' : 'px-4 py-2',
            )}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(
              'border border-border',
              compact ? 'px-2 py-1 text-sm' : 'px-4 py-2',
            )}
            >
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
