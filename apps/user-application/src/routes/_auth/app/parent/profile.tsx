import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, Plus, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import {
  ParentBottomNav,
  ParentHeader,
} from '@/components/parent-dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useParentDashboard } from '@/hooks'
import { signOut, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/parent/profile')({
  component: ParentProfilePage,
})

function ParentProfilePage() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const {
    children,
    selectedChild,
    selectChild,
    unreadAlertsCount,
    isLoading,
  } = useParentDashboard()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut(queryClient)
      navigate({ to: '/', replace: true })
    }
    catch (error) {
      console.error('Failed to sign out:', error)
      setIsSigningOut(false)
    }
  }

  const getUserInitials = () => {
    if (!session?.user?.name)
      return 'P'
    return session.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getChildInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (isLoading && children.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!selectedChild)
    return null

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      {/* Header with Child Selector */}
      <ParentHeader
        children={children}
        selectedChild={selectedChild}
        onSelectChild={child => selectChild(child.id)}
        hasNotifications={unreadAlertsCount > 0}
      />

      {/* Main Content */}
      <main className="relative z-10 px-5 pt-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6 backdrop-blur-md text-center"
          >
            <div className="relative inline-block mb-4">
              <Avatar className="h-20 w-20 border-2 border-teal-500/30">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-teal-500/10 text-teal-400 text-xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-teal-500 border-2 border-background flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {session?.user?.name || 'Parent'}
            </h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold">
              Compte Parent
            </span>
          </motion.div>

          {/* Linked Children */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Enfants liés
              </h3>
              <span className="text-xs text-muted-foreground">{children.length}</span>
            </div>
            <div className="space-y-3">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-teal-500/10 text-teal-400 text-sm font-bold">
                      {getChildInitials(child.firstName, child.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {child.firstName}
                      {' '}
                      {child.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{child.gradeName}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    child.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400',
                  )}
                  >
                    {child.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Child Button (disabled for MVP) */}
            <Button
              variant="outline"
              className="w-full mt-4 border-dashed"
              disabled
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un enfant
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Bientôt disponible
            </p>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className={cn('mr-2 h-4 w-4', isSigningOut && 'animate-spin')} />
              {isSigningOut ? 'Déconnexion en cours...' : 'Se Déconnecter'}
            </Button>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>Kurama App v1.2.0 (Beta)</p>
            <p className="mt-1">Espace Parent</p>
          </div>
        </motion.div>
      </main>

      <ParentBottomNav alertCount={unreadAlertsCount} />
    </div>
  )
}
