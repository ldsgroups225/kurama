import { Link, useRouterState } from '@tanstack/react-router'
import { BarChart3, Bell, Home, User } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Parent Bottom Navigation Component
 *
 * Features:
 * - Teal/Cyan color scheme to differentiate from student nav
 * - Floating glassmorphism design matching app style
 * - Smooth motion animations
 * - 4 items: Accueil, Stats, Alertes, Profil
 */

const parentNavItems = [
  {
    icon: Home,
    label: 'Accueil',
    href: '/app/parent',
    activeColor: 'text-teal-400',
    glowColor: 'bg-teal-500/20',
  },
  {
    icon: BarChart3,
    label: 'Stats',
    href: '/app/parent/stats',
    activeColor: 'text-cyan-400',
    glowColor: 'bg-cyan-500/20',
  },
  {
    icon: Bell,
    label: 'Alertes',
    href: '/app/parent/alerts',
    activeColor: 'text-amber-400',
    glowColor: 'bg-amber-500/20',
  },
  {
    icon: User,
    label: 'Profil',
    href: '/app/parent/profile',
    activeColor: 'text-emerald-400',
    glowColor: 'bg-emerald-500/20',
  },
] as const

interface ParentBottomNavProps {
  /** Number of unread alerts to show as badge */
  alertCount?: number
}

export function ParentBottomNav({ alertCount = 0 }: ParentBottomNavProps) {
  const router = useRouterState()
  // Clean pathname to handle potential trailing slashes
  const currentPath = router.location.pathname.replace(/\/$/, '')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl">
        <ul className="flex items-center justify-between px-2 py-2">
          {parentNavItems.map((item) => {
            const Icon = item.icon

            // Precise active state matching
            // For 'Accueil' (/app/parent), only match exact path
            // For others, allow partial matching
            const isActive = item.href === '/app/parent'
              ? currentPath === '/app/parent' || currentPath === '/app/parent/'
              : currentPath.startsWith(item.href)

            const showBadge = item.label === 'Alertes' && alertCount > 0

            return (
              <li key={item.href} className="relative flex-1">
                <Link
                  to={item.href}
                  className="group flex flex-col items-center justify-center gap-1 py-1 relative z-10 w-full outline-none"
                >
                  <div className={cn(
                    'relative p-2 rounded-xl transition-all duration-300 group-active:scale-95',
                    isActive ? item.glowColor : 'bg-transparent hover:bg-accent',
                  )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6 transition-all duration-300',
                        isActive ? cn('scale-110', item.activeColor) : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* Alert badge */}
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg">
                        {alertCount > 99 ? '99+' : alertCount}
                      </span>
                    )}

                    {/* Subtle glow effect for active state */}
                    {isActive && (
                      <motion.div
                        layoutId="parent-nav-glow"
                        className={cn('absolute inset-0 rounded-xl blur-md opacity-40', item.glowColor)}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'text-[10px] font-medium transition-colors duration-300',
                    isActive ? item.activeColor : 'text-muted-foreground',
                  )}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  <div className="h-1 w-full flex justify-center">
                    {isActive && (
                      <motion.span
                        layoutId="parent-nav-pill"
                        className={cn('h-1 w-1 rounded-full', item.activeColor.replace('text-', 'bg-'))}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
