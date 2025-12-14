import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, MessageCircle, Plus, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/groups')({
  component: GroupsPage,
})

const groups = [
  {
    id: 1,
    name: 'BAC Maths 2024',
    description: 'Entraide pour le BAC série C/D',
    members: 24,
    messages: 156,
    lastActivity: 'Active maintenant',
    gradient: 'from-blue-500 to-indigo-600',
    unread: 3,
  },
  {
    id: 2,
    name: 'Club Anglais',
    description: 'Speak English only! 🇬🇧',
    members: 18,
    messages: 89,
    lastActivity: 'Il y a 5h',
    gradient: 'from-rose-500 to-pink-600',
    unread: 0,
  },
  {
    id: 3,
    name: 'Philosophes',
    description: 'Débats et dissertations',
    members: 32,
    messages: 234,
    lastActivity: 'Il y a 1j',
    gradient: 'from-amber-400 to-orange-500',
    unread: 12,
  },
  {
    id: 4,
    name: 'SVT Experts',
    description: 'Schémas et révisions',
    members: 15,
    messages: 45,
    lastActivity: 'Il y a 2j',
    gradient: 'from-emerald-500 to-green-600',
    unread: 0,
  },
]

function GroupsPage() {
  useEffect(() => {
    const endTracking = trackRouteLoad('app-groups')
    return endTracking
  }, [])

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background - Purple/Pink Theme for 'Social' */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[120px]" />
      </div>

      <AppHeader title="Communauté" showAvatar={false} className="bg-transparent/0 border-none" />

      <main className="relative z-10 mx-auto max-w-lg px-5 pt-2">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Tes Groupes</h2>
          <p className="text-muted-foreground">Rejoins tes amis et progresse à ton rythme.</p>
        </div>

        {/* CTA */}
        <div className="mb-8">
          <Button
            className="w-full h-14 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Créer un nouveau groupe
          </Button>
        </div>

        {/* Groups List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {groups.map(group => (
            <motion.div
              key={group.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-1 backdrop-blur-xl transition-all hover:bg-accent/50"
            >
              <div className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className={cn(
                    'h-14 w-14 border-2 border-transparent bg-linear-to-br',
                    group.gradient,
                  )}
                  >
                    <AvatarFallback className="bg-transparent text-white">
                      <Users className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  {group.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                      {group.unread}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-foreground truncate pr-2 text-lg">
                      {group.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                      {group.lastActivity}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {group.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {group.members}
                      {' '}
                      membres
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {group.messages}
                      {' '}
                      msgs
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="self-center">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
