/**
 * Lazy load markdown plugins
 */
export async function loadMarkdownPlugins() {
  const [remarkGfm, remarkBreaks, rehypeHighlight] = await Promise.all([
    import('remark-gfm').then(mod => mod.default),
    import('remark-breaks').then(mod => mod.default),
    import('rehype-highlight').then(mod => mod.default),
  ])

  return {
    remarkPlugins: [remarkGfm, remarkBreaks],
    rehypePlugins: [rehypeHighlight],
  }
}
