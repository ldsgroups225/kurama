export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse">
        {/* Navigation skeleton */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="flex gap-4">
              <div className="h-10 bg-muted rounded w-24" />
              <div className="h-10 bg-muted rounded w-24" />
            </div>
          </div>
        </div>

        {/* Hero section skeleton */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="h-16 bg-muted rounded-lg w-3/4 mx-auto" />
              <div className="h-16 bg-muted rounded-lg w-2/3 mx-auto" />
            </div>
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="h-6 bg-muted rounded w-full" />
              <div className="h-6 bg-muted rounded w-5/6 mx-auto" />
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <div className="h-12 bg-muted rounded-lg w-40" />
              <div className="h-12 bg-muted rounded-lg w-40" />
            </div>
          </div>
        </div>

        {/* Content sections skeleton */}
        <div className="container mx-auto px-4 py-16 space-y-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="h-10 bg-muted rounded w-64 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="border rounded-lg p-6 space-y-3">
                    <div className="h-12 w-12 bg-muted rounded-full" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
