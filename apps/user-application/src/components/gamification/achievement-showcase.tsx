import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AchievementBadge, Achievement } from "./achievement-badge";
import { Trophy, Lock } from "@/lib/icons";

interface AchievementShowcaseProps {
  achievements: Achievement[];
  title?: string;
  maxDisplay?: number;
  className?: string;
}

export function AchievementShowcase({
  achievements,
  title = "Vos Badges",
  maxDisplay = 6,
  className
}: AchievementShowcaseProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const displayAchievements = achievements.slice(0, maxDisplay);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
          <Badge variant="secondary">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>

        {/* Achievements Grid */}
        {unlockedCount > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {displayAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                />
              ))}
            </div>

            {/* View All Link */}
            {achievements.length > maxDisplay && (
              <button className="w-full text-sm text-primary hover:underline font-medium">
                Voir tous les badges ({totalCount})
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Aucun badge débloqué
            </p>
            <p className="text-xs text-muted-foreground">
              Continuez à étudier pour débloquer vos premiers badges !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
