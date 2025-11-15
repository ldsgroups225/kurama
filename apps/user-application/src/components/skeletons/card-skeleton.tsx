import { generateUUID } from '@/utils/generateUUID'

export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-lg border p-6">
      <div className="h-4 w-3/4 rounded-sm bg-muted" />
      <div className="h-4 w-5/6 rounded-sm bg-muted" />
      <div className="h-4 w-4/6 rounded-sm bg-muted" />
    </div>
  )
}

export function AppPageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header skeleton */}
      <div className="animate-pulse border-b">
        <div className={`
          mx-auto flex max-w-lg items-center justify-between px-4 py-4
        `}
        >
          <div className="h-8 w-32 rounded-sm bg-muted" />
          <div className="h-10 w-10 rounded-full bg-muted" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-lg animate-pulse space-y-6 px-4 py-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map(() => (
            <div
              key={generateUUID()}
              className="space-y-2 rounded-lg border p-4"
            >
              <div className="h-4 w-16 rounded-sm bg-muted" />
              <div className="h-8 w-20 rounded-sm bg-muted" />
              <div className="h-3 w-24 rounded-sm bg-muted" />
            </div>
          ))}
        </div>

        {/* Cards */}
        {Array.from({ length: 3 }).map(() => (
          <CardSkeleton key={generateUUID()} />
        ))}
      </main>

      {/* Bottom nav skeleton */}
      <div className={`
        fixed right-0 bottom-0 left-0 animate-pulse border-t bg-background
      `}
      >
        <div className="mx-auto flex max-w-lg justify-around px-4 py-3">
          {Array.from({ length: 4 }).map(() => (
            <div
              key={generateUUID()}
              className="h-10 w-10 rounded-full bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
