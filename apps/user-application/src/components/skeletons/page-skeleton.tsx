import { generateUUID } from '@/utils/generateUUID'

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse">
        {/* Navigation skeleton */}
        <div className="border-b">
          <div className={`
            container mx-auto flex items-center justify-between px-4 py-4
          `}
          >
            <div className="h-8 w-32 rounded-sm bg-muted" />
            <div className="flex gap-4">
              <div className="h-10 w-24 rounded-sm bg-muted" />
              <div className="h-10 w-24 rounded-sm bg-muted" />
            </div>
          </div>
        </div>

        {/* Hero section skeleton */}
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-3/4 rounded-lg bg-muted" />
              <div className="mx-auto h-16 w-2/3 rounded-lg bg-muted" />
            </div>
            <div className="mx-auto max-w-2xl space-y-3">
              <div className="h-6 w-full rounded-sm bg-muted" />
              <div className="mx-auto h-6 w-5/6 rounded-sm bg-muted" />
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <div className="h-12 w-40 rounded-lg bg-muted" />
              <div className="h-12 w-40 rounded-lg bg-muted" />
            </div>
          </div>
        </div>

        {/* Content sections skeleton */}
        <div className="container mx-auto space-y-16 px-4 py-16">
          {Array.from({ length: 3 }).map(() => (
            <div key={generateUUID()} className="space-y-6">
              <div className="mx-auto h-10 w-64 rounded-sm bg-muted" />
              <div className={`
                grid grid-cols-1 gap-6
                md:grid-cols-3
              `}
              >
                {Array.from({ length: 3 }).map(() => (
                  <div
                    key={generateUUID()}
                    className="space-y-3 rounded-lg border p-6"
                  >
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="h-6 w-3/4 rounded-sm bg-muted" />
                    <div className="h-4 w-full rounded-sm bg-muted" />
                    <div className="h-4 w-5/6 rounded-sm bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
