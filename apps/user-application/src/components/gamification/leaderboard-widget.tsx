import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  previousRank?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
  className?: string;
}

export function LeaderboardWidget({
  entries,
  currentUserId,
  title = "Classement",
  className
}: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) return null;
    const change = entry.previousRank - entry.rank;

    if (change > 0) {
      return (
        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600">
          <TrendingUp className="h-3 w-3" />
          +{change}
        </Badge>
      );
    } else if (change < 0) {
      return (
        <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-600">
          <TrendingDown className="h-3 w-3" />
          {change}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-1">
          <Minus className="h-3 w-3" />
        </Badge>
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Badge variant="secondary">Cette semaine</Badge>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId || entry.isCurrentUser;
            const rankIcon = getRankIcon(entry.rank);

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isCurrentUser
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {rankIcon || (
                    <span className="text-sm font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCurrentUser ? "text-primary" : "text-foreground"
                  )}>
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(Vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.points.toLocaleString()} points
                  </p>
                </div>

                {/* Rank Change */}
                {getRankChange(entry)}
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <button className="w-full mt-4 text-sm text-primary hover:underline font-medium">
          Voir le classement complet
        </button>
      </CardContent>
    </Card>
  );
}
