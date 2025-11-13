import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  className?: string;
  compact?: boolean;
}

export function LevelBadge({
  level,
  currentXP,
  nextLevelXP,
  className,
  compact = false
}: LevelBadgeProps) {
  const progress = (currentXP / nextLevelXP) * 100;
  const xpRemaining = nextLevelXP - currentXP;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">{level}</span>
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Niveau {level}</span>
            <span className="text-xs text-muted-foreground">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg ring-4 ring-background">
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">Niveau {level}</h3>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {xpRemaining} XP restants
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
