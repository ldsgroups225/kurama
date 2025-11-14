import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type LucideIcon, Lock } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const rarityGradients = {
  common: "bg-gradient-common",
  rare: "bg-gradient-rare",
  epic: "bg-gradient-epic",
  legendary: "bg-gradient-legendary",
};

const rarityGradientsHorizontal = {
  common: "bg-gradient-common-horizontal",
  rare: "bg-gradient-rare-horizontal",
  epic: "bg-gradient-epic-horizontal",
  legendary: "bg-gradient-legendary-horizontal",
};

const rarityLabels = {
  common: "Commun",
  rare: "Rare",
  epic: "Épique",
  legendary: "Légendaire",
};

export function AchievementBadge({
  achievement,
  size = "md",
  onClick
}: AchievementBadgeProps) {
  const Icon = achievement.icon;
  const isLocked = !achievement.unlocked;
  const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
  const progressPercent = hasProgress
    ? (achievement.progress! / achievement.maxProgress!) * 100
    : 0;

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-24 w-24",
  };

  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        onClick && "cursor-pointer",
        isLocked && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-3">
          {/* Badge Icon */}
          <div className="relative">
            <div
              className={cn(
                sizeClasses[size],
                "rounded-full flex items-center justify-center shadow-lg ring-4 ring-background",
                isLocked
                  ? "bg-muted"
                  : rarityGradients[achievement.rarity || "common"]
              )}
            >
              {isLocked ? (
                <Lock className={cn(iconSizes[size], "text-muted-foreground")} />
              ) : (
                <Icon className={cn(iconSizes[size], "text-white")} />
              )}
            </div>

            {/* Rarity Badge */}
            {!isLocked && achievement.rarity && achievement.rarity !== "common" && (
              <div className="absolute -top-1 -right-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5",
                    achievement.rarity === "legendary" && "bg-gradient-legendary text-white",
                    achievement.rarity === "epic" && "bg-gradient-epic text-white",
                    achievement.rarity === "rare" && "bg-gradient-rare text-white"
                  )}
                >
                  {rarityLabels[achievement.rarity]}
                </Badge>
              </div>
            )}
          </div>

          {/* Achievement Info */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground line-clamp-1">
              {achievement.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {achievement.description}
            </p>
          </div>

          {/* Progress Bar */}
          {hasProgress && (
            <div className="w-full space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isLocked
                      ? "bg-muted-foreground"
                      : rarityGradientsHorizontal[achievement.rarity || "common"]
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {achievement.progress}/{achievement.maxProgress}
              </p>
            </div>
          )}

          {/* Unlocked Date */}
          {!isLocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
