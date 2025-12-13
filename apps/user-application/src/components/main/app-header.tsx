import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
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
}: AppHeaderProps) {
  const [userProfile] = useAtom(userProfileAtom)
  const { data: session } = useSession()
  const navigate = useNavigate()

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

  const [hasNotifications] = useAtom(hasUnreadNotificationsAtom)

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300 supports-backdrop-filter:bg-background/60',
      className,
    )}
    >
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {!showBackButton && showAvatar && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate({ to: '/app/profile' })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate({ to: '/app/profile' })
                  }
                }}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                <Avatar className="h-9 w-9 border border-border ring-2 ring-muted">
                  <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                  <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="flex flex-col justify-center">
              {title
                ? (
                  <h1 className="text-lg font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                    {title}
                  </h1>
                )
                : (
                  <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-0.5">{getGreeting()}</span>
                    <span className="text-sm font-bold text-foreground leading-tight">
                      {userProfile?.firstName || session?.user?.name || 'Étudiant'}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                onClick={() => navigate({ to: '/app/notifications' })}
              >
                <Bell className="h-5 w-5" />
                {hasNotifications && (
                  <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </Button>
            )}
          </div>
        </div>

        {showLevel && userLevel && (
          <div className="mt-3 pb-1 px-1 animate-in fade-in slide-in-from-top-1">
            <LevelBadge
              level={userLevel.level}
              currentXP={userLevel.currentXP}
              nextLevelXP={userLevel.nextLevelXP}
              compact
              className="bg-card/50"
            />
          </div>
        )}
      </div>
    </header>
  )
}
