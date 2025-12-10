import type { Achievement } from './achievement-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Trophy } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { AchievementBadge } from './achievement-badge'

interface AchievementShowcaseProps {
  achievements: Achievement[]
  title?: string
  maxDisplay?: number
  className?: string
}

export function AchievementShowcase({
  achievements,
  title = 'Vos Badges',
  maxDisplay = 6,
  className,
}: AchievementShowcaseProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const displayAchievements = achievements.slice(0, maxDisplay)

  return (
    <Card className={cn('py-0', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-level h-5 w-5" />
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
          <Badge variant="secondary">
            {unlockedCount}
            /
            {totalCount}
          </Badge>
        </div>

        {/* Achievements Grid */}
        {unlockedCount > 0
          ? (
            <>
              <div className="mb-4 grid grid-cols-3 gap-3">
                {displayAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="sm"
                  />
                ))}
              </div>

              {/* View All Link */}
              {achievements.length > maxDisplay && (
                <button
                  type="button"
                  className={`
                      w-full text-sm font-medium text-primary
                      hover:underline
                    `}
                >
                  Voir tous les badges (
                  {totalCount}
                  )
                </button>
              )}
            </>
          )
          : (
            <div className="py-8 text-center">
              <div className={`
                  mx-auto mb-3 flex h-16 w-16 items-center justify-center
                  rounded-full bg-muted
                `}
              >
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Aucun badge débloqué
              </p>
              <p className="text-xs text-muted-foreground">
                Continuez à étudier pour débloquer vos premiers badges !
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  )
}
