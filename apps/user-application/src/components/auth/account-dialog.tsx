import { useQueryClient } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { authClient, signOut as signOutFn } from '@/lib/auth-client'
import { LogOut, Palette } from '@/lib/icons'

interface AccountDialogProps {
  children: React.ReactNode
}

export function AccountDialog({ children }: AccountDialogProps) {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await signOutFn(queryClient)
  }

  if (!session) {
    return null
  }

  const user = session.user
  const fallbackText = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4 text-center">
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || 'User'}
            />
            <AvatarFallback className="text-2xl font-semibold">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center">
            {user.name && (
              <div className="text-lg font-semibold">{user.name}</div>
            )}
            {user.email && (
              <div className="text-sm text-muted-foreground">{user.email}</div>
            )}
          </div>
          <div className="mt-6 flex w-full flex-col gap-4">
            <div className={`
              flex w-full items-center justify-between rounded-lg border bg-card
              px-4 py-3
            `}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Palette className="h-4 w-4" />
                Theme
              </span>
              <ThemeToggle />
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
