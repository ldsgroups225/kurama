export function HeroSkeleton() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          {/* Title skeleton */}
          <div className="space-y-4">
            <div className="h-16 bg-muted rounded-lg w-3/4 mx-auto" />
            <div className="h-16 bg-muted rounded-lg w-2/3 mx-auto" />
          </div>

          {/* Subtitle skeleton */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="h-6 bg-muted rounded w-full" />
            <div className="h-6 bg-muted rounded w-5/6 mx-auto" />
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex gap-4 justify-center pt-4">
            <div className="h-12 bg-muted rounded-lg w-40" />
            <div className="h-12 bg-muted rounded-lg w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
