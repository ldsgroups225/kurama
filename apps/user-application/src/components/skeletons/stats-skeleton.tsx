import { generateUUID } from '@/utils/generateUUID'

export function StatsSkeleton() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className={`
          grid animate-pulse grid-cols-2 gap-8
          md:grid-cols-4
        `}
        >
          {Array.from({ length: 4 }).map(() => (
            <div key={generateUUID()} className="space-y-2 text-center">
              <div className="mx-auto h-12 w-24 rounded-sm bg-muted" />
              <div className="mx-auto h-4 w-32 rounded-sm bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
