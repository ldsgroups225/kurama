import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Bell,
  ChevronRight,
  Crown,
  Flame,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Sparkles,
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

export const Route = createFileRoute('/_auth/app/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Fetch real profile stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => getProfileStats(),
  })

  // Fetch subscription tier
  const { data: subscriptionTier } = useQuery({
    queryKey: ['subscription-tier'],
    queryFn: () => getSubscriptionTier(),
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
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/app/settings',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/app/notifications',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      icon: isPremium ? Sparkles : Crown,
      label: isPremium ? 'Gérer mon abonnement' : 'Passer à Premium',
      href: '/app/polar/subscriptions',
      badge: isPremium ? undefined : 'Nouveau',
      highlight: !isPremium,
      color: isPremium ? 'text-purple-400' : 'text-amber-400',
      bgColor: isPremium ? 'bg-purple-400/10' : 'bg-amber-400/10',
    },
    {
      icon: HelpCircle,
      label: 'Aide & Support',
      href: '/app/help',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
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
    <div className="relative min-h-screen bg-black pb-24 text-white selection:bg-primary/30">
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
                <Avatar className="relative h-28 w-28 border-2 border-black">
                  <AvatarImage src={session?.user?.image || undefined} className="object-cover" />
                  <AvatarFallback className="bg-zinc-900 text-2xl font-bold text-zinc-300">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Level Badge overlapped */}
                <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-black bg-zinc-800 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                  Lvl
                  {' '}
                  {stats?.level ?? 1}
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {session?.user?.name || 'Étudiant'}
                </h2>
                <p className="text-sm font-medium text-zinc-400">
                  {session?.user?.email}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isPremium && subscriptionTier && (
                  <SubscriptionBadge tier={subscriptionTier} size="md" className="border-white/10 bg-white/5 backdrop-blur-md" />
                )}
                <Badge variant="outline" className="border-white/10 bg-white/5 backdrop-blur-md">
                  <Shield className="mr-1 h-3 w-3" />
                  {stats?.gradeName || 'Lycéen'}
                </Badge>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cartes', value: stats?.totalCardsStudied ?? 0, icon: Sparkles, color: 'text-cyan-400' },
                { label: 'Points XP', value: stats?.totalXP ?? 0, icon: Zap, color: 'text-amber-400' },
                { label: 'Série', value: `${stats?.currentStreak ?? 0}j`, icon: Flame, color: 'text-orange-500' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 p-4 text-center backdrop-blur-xl transition-all hover:bg-zinc-900/70"
                >
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
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
                        : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60',
                    )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                          isHighlighted ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white',
                        )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <span className={cn(
                            'block font-medium',
                            isHighlighted ? 'text-amber-200' : 'text-zinc-200',
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
                        <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1" />
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
                className="w-full justify-center text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className={`mr-2 h-4 w-4 ${isSigningOut ? 'animate-spin' : ''}`} />
                {isSigningOut ? 'Déconnexion en cours...' : 'Se Déconnecter'}
              </Button>
            </motion.div>

            {/* Footer Info */}
            <motion.div variants={itemVariants} className="text-center text-xs text-zinc-700">
              <p>Kurama App v1.2.0 (Beta)</p>
            </motion.div>
          </motion.div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
