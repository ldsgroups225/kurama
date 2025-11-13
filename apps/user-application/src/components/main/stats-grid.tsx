import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  progress?: number;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "text-primary",
  progress
}: StatCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>

        {progress !== undefined && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
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
  );
}

interface StatsGridProps {
  stats: StatCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
