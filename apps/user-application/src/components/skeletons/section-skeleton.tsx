import { generateUUID } from '@/utils/generateUUID'

export function SectionSkeleton() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl animate-pulse space-y-12">
          {/* Section title */}
          <div className="space-y-4 text-center">
            <div className="mx-auto h-10 w-2/3 rounded-sm bg-muted" />
            <div className="mx-auto h-6 w-3/4 rounded-sm bg-muted" />
          </div>

          {/* Content grid */}
          <div className={`
            grid grid-cols-1 gap-6
            md:grid-cols-3
          `}
          >
            {Array.from({ length: 6 }).map(() => (
              <div
                key={generateUUID()}
                className="space-y-3 rounded-lg border p-6"
              >
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="h-5 w-3/4 rounded-sm bg-muted" />
                <div className="h-4 w-full rounded-sm bg-muted" />
                <div className="h-4 w-5/6 rounded-sm bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FooterSkeleton() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className={`
          grid animate-pulse grid-cols-1 gap-8
          md:grid-cols-4
        `}
        >
          {Array.from({ length: 4 }).map(() => (
            <div key={generateUUID()} className="space-y-4">
              <div className="h-5 w-24 rounded-sm bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded-sm bg-muted" />
                <div className="h-4 w-28 rounded-sm bg-muted" />
                <div className="h-4 w-36 rounded-sm bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
