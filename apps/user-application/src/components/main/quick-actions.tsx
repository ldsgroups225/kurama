import type { LucideIcon } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface QuickActionProps {
  icon: LucideIcon
  label: string
  color?: string
  onClick?: () => void
}

export function QuickAction({ icon: Icon, label, color = 'bg-primary/10 text-primary', onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 rounded-xl p-4 transition-colors
        hover:bg-muted/50
      `}
    >
      <div className={cn(`
        flex h-14 w-14 items-center justify-center rounded-2xl
      `, color)}
      >
        <Icon className="h-7 w-7" />
      </div>
      <span className="text-center text-xs font-medium">{label}</span>
    </button>
  )
}

interface QuickActionsProps {
  actions: QuickActionProps[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {actions.map(action => (
            <QuickAction key={generateUUID()} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
