import { generateUUID } from '@/utils/generateUUID'

export function FormSkeleton() {
  return (
    <div className={`
      flex min-h-screen items-center justify-center bg-background p-4
    `}
    >
      <div className="w-full max-w-2xl animate-pulse space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-3/4 rounded-lg bg-muted" />
          <div className="mx-auto h-6 w-2/3 rounded-sm bg-muted" />
        </div>

        {/* Form fields */}
        <div className="space-y-6 rounded-lg border bg-card p-8">
          {Array.from({ length: 5 }).map(() => (
            <div key={generateUUID()} className="space-y-2">
              <div className="h-4 w-32 rounded-sm bg-muted" />
              <div className="h-10 w-full rounded-sm bg-muted" />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-10 flex-1 rounded-sm bg-muted" />
            <div className="h-10 flex-1 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
