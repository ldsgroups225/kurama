export function FormSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-pulse">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="h-10 bg-muted rounded-lg w-3/4 mx-auto" />
          <div className="h-6 bg-muted rounded w-2/3 mx-auto" />
        </div>

        {/* Form fields */}
        <div className="space-y-6 bg-card border rounded-lg p-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-10 bg-muted rounded flex-1" />
            <div className="h-10 bg-muted rounded flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
