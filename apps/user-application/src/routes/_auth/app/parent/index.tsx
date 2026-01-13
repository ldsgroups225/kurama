import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import {
  ActivityStatusCard,
  ParentBottomNav,
  ParentHeader,
  StreakCard,
  WeeklyStudyCard,
} from '@/components/parent-dashboard'
import { useParentDashboard } from '@/hooks'
import { userProfileAtom } from '@/lib/atoms'

export const Route = createFileRoute('/_auth/app/parent/')({
  component: ParentDashboard,
})

function ParentDashboard() {
  const navigate = useNavigate()
  const userProfile = useAtomValue(userProfileAtom)
  const {
    children,
    selectedChild,
    selectChild,
    childStats,
    unreadAlertsCount,
    isLoading,
  } = useParentDashboard()

  // Redirect students if they land here
  useEffect(() => {
    if (userProfile && userProfile.userType !== 'parent') {
      navigate({ to: '/app', replace: true })
    }
  }, [userProfile?.userType, navigate])

  if (isLoading && children.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!selectedChild || !childStats)
    return null

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background - Teal theme for parents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[80%] h-[40%] rounded-full bg-teal-600/5 blur-[100px]" />
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Activity Status Card */}
          <ActivityStatusCard
            childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
            childImage={selectedChild.image}
            lastActiveAt={childStats.lastActiveAt}
            status={childStats.activityStatus}
          />

          {/* Two-column grid for Weekly Study and Streak */}
          <div className="grid grid-cols-1 gap-4">
            <WeeklyStudyCard
              studyMinutes={childStats.weeklyStudyMinutes}
              goalMinutes={childStats.weeklyGoalMinutes}
            />

            <StreakCard
              currentStreak={childStats.currentStreak}
              longestStreak={childStats.longestStreak}
            />
          </div>

          {/* Quick Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-4 backdrop-blur-md"
          >
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Résumé rapide
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{childStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{childStats.totalCards}</p>
                <p className="text-xs text-muted-foreground">Cartes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-400">
                  {childStats.successRate}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Réussite</p>
              </div>
            </div>
          </motion.div>

          {/* Alerts Preview */}
          {unreadAlertsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {unreadAlertsCount}
                    {' '}
                    alerte(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consultez l'onglet alertes pour plus de détails.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Parent Bottom Navigation */}
      <ParentBottomNav alertCount={unreadAlertsCount} />
    </div>
  )
}
