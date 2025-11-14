import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  onClick?: () => void;
}

export function QuickAction({ icon: Icon, label, color = "bg-primary/10 text-primary", onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", color)}>
        <Icon className="h-7 w-7" />
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
}

interface QuickActionsProps {
  actions: QuickActionProps[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
