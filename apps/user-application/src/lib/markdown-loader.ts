/**
 * Dynamic markdown rendering utilities
 * Lazy loads react-markdown and plugins to reduce initial bundle size
 */

import { lazy, ComponentType } from 'react';
import type { Components } from 'react-markdown';

// Lazy load react-markdown
export const ReactMarkdown = lazy(() =>
  import('react-markdown').then((mod) => ({ default: mod.default }))
);

// Lazy load markdown plugins
export async function loadMarkdownPlugins() {
  const [remarkGfm, remarkBreaks, rehypeHighlight] = await Promise.all([
    import('remark-gfm').then((mod) => mod.default),
    import('remark-breaks').then((mod) => mod.default),
    import('rehype-highlight').then((mod) => mod.default),
  ]);

  return {
    remarkPlugins: [remarkGfm, remarkBreaks],
    rehypePlugins: [rehypeHighlight],
  };
}

/**
 * Custom markdown components for consistent styling
 */
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className= "text-3xl font-bold mb-4 mt-6" > { children } </h1>
  ),
h2: ({ children }) => (
  <h2 className= "text-2xl font-semibold mb-3 mt-5" > { children } </h2>
  ),
h3: ({ children }) => (
  <h3 className= "text-xl font-semibold mb-2 mt-4" > { children } </h3>
  ),
p: ({ children }) => <p className="mb-4 leading-relaxed" > { children } </p>,
ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2" > { children } </ul>,
ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2" > { children } </ol>,
li: ({ children }) => <li className="leading-relaxed" > { children } </li>,
code: ({ inline, children, ...props }: any) =>
  inline ? (
    <code className= "bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props }>
      { children }
      </code>
    ) : (
  <code className= "block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props }>
    { children }
    </code>
    ),
pre: ({ children }) => <pre className="mb-4" > { children } </pre>,
blockquote: ({ children }) => (
  <blockquote className= "border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" >
  { children }
  </blockquote>
  ),
a: ({ children, href }) => (
  <a
      href= { href }
className = "text-primary hover:underline"
target = "_blank"
rel = "noopener noreferrer"
  >
  { children }
  </a>
  ),
};

/**
 * Hook to load markdown with plugins
 * Usage:
 * const { Markdown, isLoading } = useMarkdown();
 * if (isLoading) return <Skeleton />;
 * return <Markdown>{content}</Markdown>;
 */
export function useMarkdownLoader() {
  const [plugins, setPlugins] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadMarkdownPlugins().then((loadedPlugins) => {
      setPlugins(loadedPlugins);
      setIsLoading(false);
    });
  }, []);

  return { plugins, isLoading };
}

// Re-export for convenience
import React from 'react';
