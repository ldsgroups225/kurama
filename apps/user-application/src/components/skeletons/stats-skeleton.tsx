export function StatsSkeleton() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-12 bg-muted rounded w-24 mx-auto" />
              <div className="h-4 bg-muted rounded w-32 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
