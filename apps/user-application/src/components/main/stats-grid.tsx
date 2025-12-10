import type { LucideIcon } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/card'
import { generateUUID } from '@/utils/generateUUID'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  subValue?: string
  color?: string
  progress?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'text-primary',
  progress,
}: StatCardProps) {
  return (
    <Card className={`
      overflow-hidden transition-shadow
      hover:shadow-md py-0
    `}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className={`
            flex h-10 w-10 items-center justify-center rounded-full bg-muted
            ${color}
          `}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>

        {progress !== undefined && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`
                  h-full rounded-full bg-primary transition-all duration-500
                `}
                style={{ width: `${progress}%` }}
              />
            </div>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  stats: StatCardProps[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(stat => (
        <StatCard key={generateUUID()} {...stat} />
      ))}
    </div>
  )
}
