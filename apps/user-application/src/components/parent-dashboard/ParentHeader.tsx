import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { userProfileAtom } from '@/lib/atoms'
import { Bell } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface ChildProfile {
  id: string
  firstName: string
  lastName: string
  image?: string
  gradeName?: string
}

interface ParentHeaderProps {
  children: ChildProfile[]
  selectedChild: ChildProfile | null
  onSelectChild: (child: ChildProfile) => void
  hasNotifications?: boolean
  className?: string
}

/**
 * Parent Header Component
 *
 * Features:
 * - Greeting with parent name
 * - Child selector dropdown
 * - Notification bell
 */
export function ParentHeader({
  children,
  selectedChild,
  onSelectChild,
  hasNotifications = false,
  className,
}: ParentHeaderProps) {
  const [userProfile] = useAtom(userProfileAtom)
  const navigate = useNavigate()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12)
      return 'Bonjour'
    if (hour < 18)
      return 'Bon après-midi'
    return 'Bonsoir'
  }

  const parentName = userProfile?.firstName || 'Parent'

  const getChildInitials = (child: ChildProfile) => {
    return `${child.firstName[0]}${child.lastName[0]}`.toUpperCase()
  }

  return (
    <header className={cn('sticky top-0 z-40 w-full backdrop-blur-xl bg-background/60', className)}>
      <div className="mx-auto max-w-lg px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Greeting */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-0.5">
              {getGreeting()}
            </span>
            <span className="text-lg font-bold text-foreground leading-tight">
              {parentName}
              {' '}
              👋
            </span>
          </div>

          {/* Right side - Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full bg-card/50 border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all backdrop-blur-sm"
            onClick={() => navigate({ to: '/app/parent/alerts' })}
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            )}
          </Button>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-accent transition-colors"
                >
                  {selectedChild && (
                    <>
                      <Avatar className="h-10 w-10 border-2 border-teal-500/30">
                        <AvatarImage src={selectedChild.image} />
                        <AvatarFallback className="bg-teal-500/10 text-teal-400 text-sm font-bold">
                          {getChildInitials(selectedChild)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-foreground">
                          {selectedChild.firstName}
                          {' '}
                          {selectedChild.lastName}
                        </p>
                        {selectedChild.gradeName && (
                          <p className="text-xs text-muted-foreground">{selectedChild.gradeName}</p>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[calc(100vw-40px)] max-w-[400px]">
                {children.map(child => (
                  <DropdownMenuItem
                    key={child.id}
                    onClick={() => onSelectChild(child)}
                    className="flex items-center gap-3 p-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={child.image} />
                      <AvatarFallback className="bg-teal-500/10 text-teal-400 text-xs font-bold">
                        {getChildInitials(child)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {child.firstName}
                        {' '}
                        {child.lastName}
                      </p>
                      {child.gradeName && (
                        <p className="text-xs text-muted-foreground">{child.gradeName}</p>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
