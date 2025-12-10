import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Check, Clock, Flame, Loader2 } from '@/lib/icons'

interface ChallengeCardProps {
  title: string
  description: string
  duration: string
  icon?: React.ReactNode
  onStart?: () => void
  isLoading?: boolean
  // Daily challenge specific props
  isCompleted?: boolean
  isInProgress?: boolean
  score?: number
  xpEarned?: number
  consecutiveDays?: number
  timeUntilReset?: number
}

function formatTimeUntilReset(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export function ChallengeCard({
  title,
  description,
  duration,
  icon,
  onStart,
  isLoading,
  isCompleted,
  isInProgress,
  score,
  xpEarned,
  consecutiveDays,
  timeUntilReset,
}: ChallengeCardProps) {
  // Completed state
  if (isCompleted) {
    return (
      <Card className="overflow-hidden py-0 border-success/30 bg-linear-to-br from-success/10 via-success/5 to-background">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <Check className="h-6 w-6 text-success" />
              </div>
              <Badge variant="secondary" className="gap-1 bg-success/20 text-success">
                <Check className="h-3 w-3" />
                Complété
              </Badge>
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>

          <div className="mb-4 flex items-center gap-4 text-sm">
            <span className="font-semibold text-success">
              {score}
              %
            </span>
            <span className="text-xp">
              +
              {xpEarned}
              {' '}
              XP
            </span>
            {consecutiveDays && consecutiveDays > 1 && (
              <span className="flex items-center gap-1 text-streak">
                <Flame className="h-4 w-4" />
                {consecutiveDays}
                {' '}
                jours
              </span>
            )}
          </div>

          {timeUntilReset && (
            <p className="text-sm text-muted-foreground">
              <Clock className="mr-1 inline h-4 w-4" />
              Prochain défi dans
              {' '}
              {formatTimeUntilReset(timeUntilReset)}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default/Available state
  return (
    <Card className={`
      overflow-hidden border-primary/20 bg-linear-to-br from-primary/10
      via-primary/5 to-background py-0
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
          disabled={isLoading}
        >
          {isLoading
            ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              )
            : (
                <>
                  {isInProgress ? 'Reprendre' : 'Commencer'}
                  <ArrowRight className={`
                ml-2 h-4 w-4 transition-transform
                group-hover:translate-x-1
              `}
                  />
                </>
              )}
        </Button>
      </CardContent>
    </Card>
  )
}
