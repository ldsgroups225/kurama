import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  ParentBottomNav,
  ParentHeader,
  SubjectPerformanceGrid,
} from '@/components/parent-dashboard'
import { useParentDashboard } from '@/hooks'

export const Route = createFileRoute('/_auth/app/parent/stats')({
  component: ParentStatsPage,
})

function ParentStatsPage() {
  const {
    children,
    selectedChild,
    selectChild,
    childStats,
    subjectPerformance,
    unreadAlertsCount,
    isLoading,
  } = useParentDashboard()

  if (isLoading && !selectedChild) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!selectedChild || !childStats)
    return null

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <ParentHeader
        children={children}
        selectedChild={selectedChild}
        onSelectChild={child => selectChild(child.id)}
        hasNotifications={unreadAlertsCount > 0}
      />

      {/* Main Content */}
      <main className="relative z-10 px-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Weekly Activity Chart Placeholder */}
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Activité 7 jours
            </h3>
            <div className="h-40 w-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm flex items-end justify-between px-4 pb-4 pt-10">
              {[45, 60, 30, 80, 50, 90, 40].map((val, i) => (
                <div key={val} className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    className="w-8 rounded-t-lg bg-teal-500/40 border-t-2 border-teal-400"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Subject Performance */}
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Par matière
            </h3>
            <SubjectPerformanceGrid performance={subjectPerformance} />
          </section>

          {/* Recent Sessions */}
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Sessions récentes
            </h3>
            <div className="space-y-2">
              {childStats.recentSessions && childStats.recentSessions.length > 0
                ? (
                    childStats.recentSessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{session.subjectName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(session.startedAt).toLocaleDateString()}
                            {' '}
                            •
                            {Math.round((session.duration || 0) / 60)}
                            {' '}
                            min
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-teal-400">
                            {session.cardsReviewed > 0 ? Math.round((session.cardsCorrect / session.cardsReviewed) * 100) : 0}
                            %
                          </span>
                          <p className="text-[10px] text-muted-foreground">Réussite</p>
                        </div>
                      </div>
                    ))
                  )
                : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Aucune session récente.
                    </p>
                  )}
            </div>
          </section>
        </motion.div>
      </main>

      <ParentBottomNav alertCount={unreadAlertsCount} />
    </div>
  )
}
