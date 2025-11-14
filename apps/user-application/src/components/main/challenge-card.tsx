import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowRight } from "@/lib/icons";

interface ChallengeCardProps {
  title: string;
  description: string;
  duration: string;
  icon?: React.ReactNode;
  onStart?: () => void;
}

export function ChallengeCard({
  title,
  description,
  duration,
  icon,
  onStart,
}: ChallengeCardProps) {
  return (
    <Card className="overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              {icon || <Flame className="h-6 w-6 text-primary" />}
            </div>
            <Badge variant="secondary" className="text-xs">
              {duration}
            </Badge>
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <Button
          onClick={onStart}
          className="w-full group"
        >
          Commencer
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
