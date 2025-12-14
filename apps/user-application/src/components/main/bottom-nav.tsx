import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { BarChart3, BookOpen, Home, User, Users } from '@/lib/icons'
import { cn } from '@/lib/utils'

/**
 * Bottom Navigation Component
 *
 * Features:
 * - Floating glassmorphism design
 * - Smooth motion animations
 * - Dynamic active states with glow effects
 * - Haptic-like visual feedback on touch
 */

const navItems = [
  {
    icon: Home,
    label: 'Accueil',
    href: '/app',
    activeColor: 'text-indigo-400',
    glowColor: 'bg-indigo-500/20',
  },
  {
    icon: BookOpen,
    label: 'Leçons',
    href: '/app/subjects',
    activeColor: 'text-blue-400',
    glowColor: 'bg-blue-500/20',
  },
  {
    icon: Users,
    label: 'Groupes',
    href: '/app/groups',
    activeColor: 'text-purple-400',
    glowColor: 'bg-purple-500/20',
  },
  {
    icon: BarChart3,
    label: 'Progrès',
    href: '/app/progress',
    activeColor: 'text-emerald-400',
    glowColor: 'bg-emerald-500/20',
  },
  {
    icon: User,
    label: 'Profil',
    href: '/app/profile',
    activeColor: 'text-amber-400',
    glowColor: 'bg-amber-500/20',
  },
] as const

export function BottomNav() {
  const router = useRouterState()
  // Clean pathname to handle potential trailing slashes
  const currentPath = router.location.pathname.replace(/\/$/, '')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl">
        <ul className="flex items-center justify-between px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon

            // Precise active state matching
            // For 'Home' (/app), only match exact path to avoid highlighting on every sub-route
            // For others, allow partial matching (e.g. /app/subjects/math should highlight Leçons)
            const isActive = item.href === '/app'
              ? currentPath === '/app' || currentPath === '/app/'
              : currentPath.startsWith(item.href)

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

                    {/* Subtle glow dot inside the active icon container */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className={cn('absolute inset-0 rounded-xl blur-md opacity-40', item.glowColor.replace('bg-', 'bg-'))}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Active Indicator Dot */}
                  <div className="h-1 w-full flex justify-center mt-1">
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
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
