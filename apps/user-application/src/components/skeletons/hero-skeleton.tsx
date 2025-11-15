export function HeroSkeleton() {
  return (
    <div className={`
      relative flex min-h-screen items-center justify-center bg-background
    `}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl animate-pulse space-y-8">
          {/* Title skeleton */}
          <div className="space-y-4">
            <div className="mx-auto h-16 w-3/4 rounded-lg bg-muted" />
            <div className="mx-auto h-16 w-2/3 rounded-lg bg-muted" />
          </div>

          {/* Subtitle skeleton */}
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="h-6 w-full rounded-sm bg-muted" />
            <div className="mx-auto h-6 w-5/6 rounded-sm bg-muted" />
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-12 w-40 rounded-lg bg-muted" />
            <div className="h-12 w-40 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
