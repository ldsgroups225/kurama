import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Crown,
  Flame,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  User,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { SubscriptionBadge } from '@/components/payments/polar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSubscriptionTier } from '@/core/functions/payments'
import { getProfileStats } from '@/core/functions/profile'
import { signOut, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const userId = session?.user?.id

  // Fetch real profile stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: () => getProfileStats(),
    enabled: !!userId && !isSigningOut,
  })

  // Fetch subscription tier
  const { data: subscriptionTier } = useQuery({
    queryKey: ['subscription-tier', userId],
    queryFn: () => getSubscriptionTier(),
    enabled: !!userId && !isSigningOut,
  })

  const isPremium = subscriptionTier && subscriptionTier !== 'free'

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
      return 'U'
    return session.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const menuItems = [
    {
      icon: User,
      label: 'Informations Personnelles',
      href: '/app/profile/edit',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/app/settings',
      color: 'text-zinc-600 dark:text-zinc-400',
      bgColor: 'bg-zinc-500/10 dark:bg-zinc-400/10',
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/app/notifications',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10 dark:bg-yellow-400/10',
    },
    {
      icon: isPremium ? Award : Crown,
      label: isPremium ? 'Gérer mon abonnement' : 'Passer à Premium',
      href: '/app/polar/subscriptions',
      badge: isPremium ? undefined : 'Nouveau',
      highlight: !isPremium,
      color: isPremium ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400',
      bgColor: isPremium ? 'bg-purple-500/10 dark:bg-purple-400/10' : 'bg-amber-500/10 dark:bg-amber-400/10',
    },
    {
      icon: HelpCircle,
      label: 'Aide & Support',
      href: '/app/help',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative min-h-screen bg-background pb-24 text-foreground selection:bg-primary/30">
      {/* Ambient background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[100px]" />
        <div className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <AppHeader title="Mon Profil" showAvatar={false} className="bg-transparent/0 backdrop-blur-md" />

        <main className="mx-auto max-w-lg px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Profile Header */}
            <motion.div variants={itemVariants} className="relative text-center">
              <div className="relative inline-block">
                <div className="absolute -inset-0.5 animate-pulse rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm" />
                <Avatar className="relative h-28 w-28 border-2 border-background shadow-xl">
                  <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                  <AvatarFallback className="bg-muted text-2xl font-bold text-muted-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Level Badge overlapped */}
                {/* Level Badge overlapped */}
                <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-background bg-card px-2 py-0.5 text-xs font-bold text-foreground shadow-lg">
                  Lvl
                  {' '}
                  {stats?.level ?? 1}
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="mt-4 space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {session?.user?.name || 'Étudiant'}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isPremium && subscriptionTier && (
                  <SubscriptionBadge tier={subscriptionTier} size="md" className="border-border bg-card/50 backdrop-blur-md text-foreground" />
                )}
                <Badge variant="outline" className="border-border bg-card/50 backdrop-blur-md text-foreground">
                  <Shield className="mr-1 h-3 w-3" />
                  {stats?.gradeName || 'Lycéen'}
                </Badge>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cartes', value: stats?.totalCardsStudied ?? 0, icon: BookOpen, color: 'text-cyan-400' },
                { label: 'Points XP', value: stats?.totalXP ?? 0, icon: Zap, color: 'text-amber-400' },
                { label: 'Série', value: `${stats?.currentStreak ?? 0}j`, icon: Flame, color: 'text-orange-500' },
              ].map(stat => (
                <div
                  key={generateUUID()}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-center backdrop-blur-xl transition-all hover:bg-accent/50"
                >
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Menu Items */}
            <motion.div variants={itemVariants} className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isHighlighted = 'highlight' in item && item.highlight

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate({ to: item.href })}
                    className="group relative w-full overflow-hidden rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className={cn(
                      'relative flex items-center justify-between border p-4 backdrop-blur-xl transition-colors',
                      isHighlighted
                        ? 'border-amber-500/30 bg-linear-to-r from-amber-500/10 to-orange-500/10'
                        : 'border-border bg-card hover:bg-accent/50',
                    )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                          isHighlighted ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground',
                        )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <span className={cn(
                            'block font-medium',
                            isHighlighted ? 'text-amber-600 dark:text-amber-200' : 'text-foreground',
                          )}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.badge && (
                          <Badge className="border-0 bg-linear-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </motion.div>

            {/* Sign Out */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className={`mr-2 h-4 w-4 ${isSigningOut ? 'animate-spin' : ''}`} />
                {isSigningOut ? 'Déconnexion en cours...' : 'Se Déconnecter'}
              </Button>
            </motion.div>

            {/* Footer Info */}
            <motion.div variants={itemVariants} className="text-center text-xs text-muted-foreground">
              <p>Kurama App v1.2.0 (Beta)</p>
            </motion.div>
          </motion.div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
