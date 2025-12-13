import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { LevelBadge } from '@/components/gamification'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { hasUnreadNotificationsAtom, userProfileAtom } from '@/lib/atoms'
import { useSession } from '@/lib/auth-client'
import { ArrowLeft, Bell } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  title?: string
  showAvatar?: boolean
  showNotifications?: boolean
  showLevel?: boolean
  showBackButton?: boolean
  onBackClick?: () => void
  userLevel?: {
    level: number
    currentXP: number
    nextLevelXP: number
  }
  className?: string
  /** Hero variant for dashboard - shows large greeting with gradient name */
  variant?: 'default' | 'hero'
}

export function AppHeader({
  title,
  showAvatar = true,
  showNotifications = true,
  showLevel = false,
  showBackButton = false,
  onBackClick,
  userLevel,
  className,
  variant = 'default',
}: AppHeaderProps) {
  const [userProfile] = useAtom(userProfileAtom)
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [hasNotifications] = useAtom(hasUnreadNotificationsAtom)
  const [isGreetingVisible, setIsGreetingVisible] = useState(true)
  const greetingRef = useRef<HTMLDivElement>(null)

  // Use IntersectionObserver to detect when greeting scrolls out of view
  useEffect(() => {
    if (variant !== 'hero' || !greetingRef.current)
      return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          // Greeting is visible when intersecting
          setIsGreetingVisible(entry.isIntersecting)
        }
      },
      {
        // Trigger when greeting starts to leave the top of viewport
        rootMargin: '-60px 0px 0px 0px',
        threshold: 0,
      },
    )

    observer.observe(greetingRef.current)
    return () => observer.disconnect()
  }, [variant])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12)
      return 'Bonjour'
    if (hour < 18)
      return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase()
    }
    if (session?.user?.name) {
      return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    }
    else {
      navigate({ to: '..' })
    }
  }

  const userName = userProfile?.firstName || session?.user?.name || 'Étudiant'

  // Hero variant - sticky top bar + scrollable greeting section
  if (variant === 'hero') {
    return (
      <>
        {/* Sticky top bar - always visible with blur to prevent content overlap */}
        <header className={cn(
          'sticky top-0 z-40 w-full backdrop-blur-xl transition-all duration-200',
          isGreetingVisible ? 'bg-background/60' : 'bg-background/80 border-b border-border',
          className,
        )}
        >
          <div className="mx-auto max-w-lg px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showAvatar && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate({ to: '/app/profile' })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate({ to: '/app/profile' })
                      }
                    }}
                    className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Avatar className="h-10 w-10 border-2 border-border ring-2 ring-muted shadow-lg">
                      <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                      <AvatarFallback className="bg-muted text-sm font-bold text-muted-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* Compact info - fades in when greeting scrolls out */}
                <div className={cn(
                  'flex flex-col transition-all duration-200',
                  isGreetingVisible ? 'opacity-0 translate-x-[-8px]' : 'opacity-100 translate-x-0',
                )}
                >
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-0.5">
                    {getGreeting()}
                  </span>
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {userName}
                  </span>
                </div>
              </div>

              {showNotifications && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full bg-card/50 border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all backdrop-blur-sm"
                  onClick={() => navigate({ to: '/app/notifications' })}
                >
                  <Bell className="h-5 w-5" />
                  {hasNotifications && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero greeting section - scrolls with content */}
        <div ref={greetingRef} className="mx-auto max-w-lg px-5 pt-2 pb-4">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
                {getGreeting()}
                ,
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {userName}
                  {' '}
                  👋
                </span>
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Prêt à surpasser vos limites ?</p>
            </div>

            {/* Premium Level Badge */}
            {showLevel && userLevel && (
              <LevelBadge
                level={userLevel.level}
                currentXP={userLevel.currentXP}
                nextLevelXP={userLevel.nextLevelXP}
                compact
                className="bg-card p-4 rounded-2xl border border-border backdrop-blur-xl shadow-xl"
              />
            )}
          </div>
        </div>
      </>
    )
  }

  // Default variant - enhanced compact header for inner pages
  return (
    <header className={cn(
      'sticky top-0 z-40 w-full backdrop-blur-xl transition-all duration-300',
      className,
    )}
    >
      <div className="mx-auto max-w-lg px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button or Title */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 shrink-0 rounded-full bg-card/50 border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {title && (
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
            )}

            {!title && !showBackButton && showAvatar && (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate({ to: '/app/profile' })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate({ to: '/app/profile' })
                    }
                  }}
                  className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Avatar className="h-10 w-10 border-2 border-border ring-2 ring-muted shadow-md">
                    <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                    <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-0.5">
                    {getGreeting()}
                  </span>
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {userName}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right side - Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full bg-card/50 border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all backdrop-blur-sm"
              onClick={() => navigate({ to: '/app/notifications' })}
            >
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
              )}
            </Button>
          )}
        </div>

        {/* Level Badge for default variant */}
        {showLevel && userLevel && (
          <div className="mt-4">
            <LevelBadge
              level={userLevel.level}
              currentXP={userLevel.currentXP}
              nextLevelXP={userLevel.nextLevelXP}
              compact
              className="bg-card/50 p-3 rounded-xl border border-border backdrop-blur-sm"
            />
          </div>
        )}
      </div>
    </header>
  )
}
