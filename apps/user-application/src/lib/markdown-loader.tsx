/**
 * Hook to load markdown with plugins
 * Usage:
 * const { Markdown, isLoading } = useMarkdown();
 * if (isLoading) return <Skeleton />;
 * return <Markdown>{content}</Markdown>;
 */

import React from 'react'
import { loadMarkdownPlugins } from './markdown-plugins'

export function useMarkdownLoader() {
  const [plugins, setPlugins] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadMarkdownPlugins().then((loadedPlugins) => {
      setPlugins(loadedPlugins)
      setIsLoading(false)
    })
  }, [])

  return { plugins, isLoading }
}
