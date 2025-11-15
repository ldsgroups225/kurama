import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Flame } from '@/lib/icons'

interface ChallengeCardProps {
  title: string
  description: string
  duration: string
  icon?: React.ReactNode
  onStart?: () => void
}

export function ChallengeCard({
  title,
  description,
  duration,
  icon,
  onStart,
}: ChallengeCardProps) {
  return (
    <Card className={`
      overflow-hidden border-primary/20 bg-linear-to-br from-primary/10
      via-primary/5 to-background
    `}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`
              flex h-12 w-12 items-center justify-center rounded-full
              bg-primary/20
            `}
            >
              {icon || <Flame className="h-6 w-6 text-primary" />}
            </div>
            <Badge variant="secondary" className="text-xs">
              {duration}
            </Badge>
          </div>
        </div>

        <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>

        <Button
          onClick={onStart}
          className="group w-full"
        >
          Commencer
          <ArrowRight className={`
            ml-2 h-4 w-4 transition-transform
            group-hover:translate-x-1
          `}
          />
        </Button>
      </CardContent>
    </Card>
  )
}
