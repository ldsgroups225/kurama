import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Users, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    icon: Home,
    label: "Accueil",
    href: "/app" as const,
  },
  {
    icon: BookOpen,
    label: "Leçons",
    href: "/app/lessons" as const,
  },
  {
    icon: Users,
    label: "Groupes",
    href: "/app/groups" as const,
  },
  {
    icon: BarChart3,
    label: "Progrès",
    href: "/app/progress" as const,
  },
  {
    icon: User,
    label: "Profil",
    href: "/app/profile" as const,
  },
];

export function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
