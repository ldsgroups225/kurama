import { Link, useRouterState } from '@tanstack/react-router'
import { BarChart3, BookOpen, Home, User, Users } from '@/lib/icons'
import { cn } from '@/lib/utils'

const navItems = [
  {
    icon: Home,
    label: 'Accueil',
    href: '/app' as const,
  },
  {
    icon: BookOpen,
    label: 'Leçons',
    href: '/app/subjects' as const,
  },
  {
    icon: Users,
    label: 'Groupes',
    href: '/app/groups' as const,
  },
  {
    icon: BarChart3,
    label: 'Progrès',
    href: '/app/progress' as const,
  },
  {
    icon: User,
    label: 'Profil',
    href: '/app/profile' as const,
  },
]

export function BottomNav() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav className={`
      fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background
    `}
    >
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  `
                    flex flex-col items-center justify-center gap-1 rounded-xl
                    px-4 py-2 transition-all duration-200
                  `,
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : `
                      text-muted-foreground
                      hover:text-foreground
                    `,
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
