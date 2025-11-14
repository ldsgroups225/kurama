export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-4 bg-muted rounded w-4/6" />
    </div>
  );
}

export function AppPageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header skeleton */}
      <div className="border-b animate-pulse">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-32" />
          <div className="h-10 w-10 bg-muted rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-lg px-4 py-6 space-y-6 animate-pulse">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          ))}
        </div>

        {/* Cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </main>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background animate-pulse">
        <div className="mx-auto max-w-lg px-4 py-3 flex justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-10 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
