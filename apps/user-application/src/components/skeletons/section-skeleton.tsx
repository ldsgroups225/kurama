export function SectionSkeleton() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12 animate-pulse">
          {/* Section title */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-muted rounded w-2/3 mx-auto" />
            <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-3">
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-5 bg-muted rounded w-24" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-28" />
                <div className="h-4 bg-muted rounded w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
