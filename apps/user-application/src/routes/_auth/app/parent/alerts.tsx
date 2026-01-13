import { createFileRoute } from '@tanstack/react-router'
import { Bell, Check } from 'lucide-react'
import { motion } from 'motion/react'
import {
  ParentBottomNav,
  ParentHeader,
} from '@/components/parent-dashboard'
import { Button } from '@/components/ui/button'
import { useParentAlerts, useParentDashboard } from '@/hooks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/parent/alerts')({
  component: ParentAlertsPage,
})

function ParentAlertsPage() {
  const {
    children,
    selectedChild,
    selectChild,
    unreadAlertsCount: totalUnread,
  } = useParentDashboard()

  const {
    alerts,
    markAsRead,
    markAllAsRead,
  } = useParentAlerts()

  if (!selectedChild)
    return null

  // Filter alerts for the selected child (though hook already provides some filtering usually)
  // But let's use the hook's filtered alerts if we want child-specific,
  // or total if we want all. PRD says "liste des alertes" - let's keep it contextual to child.
  const filteredAlerts = alerts.filter(a => a.childId === selectedChild.id)
  const childUnreadCount = filteredAlerts.filter(a => !a.read).length

  const getAlertIcon = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
    }
  }

  const getAlertStyle = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning': return 'border-amber-500/20 bg-amber-500/5'
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5'
      case 'info': return 'border-blue-500/20 bg-blue-500/5'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1)
      return 'À l\'instant'
    if (diffHours < 24)
      return `Il y a ${diffHours}h`
    if (diffDays === 1)
      return 'Hier'
    return `Il y a ${diffDays}j`
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      {/* Header with Child Selector */}
      <ParentHeader
        children={children}
        selectedChild={selectedChild}
        onSelectChild={child => selectChild(child.id)}
        hasNotifications={totalUnread > 0}
      />

      <div className="px-5 py-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Alertes</h2>
        {childUnreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-teal-400 hover:text-teal-300 h-8"
          >
            <Check className="h-4 w-4 mr-1" />
            Tout lire
          </Button>
        )}
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-5 pt-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {filteredAlerts.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    Aucune alerte
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Vous serez notifié en cas d'évènement important concernant
                    {' '}
                    {selectedChild.firstName}
                    .
                  </p>
                </div>
              )
            : (
                filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={() => markAsRead(alert.id)}
                      className={cn(
                        'w-full text-left rounded-2xl border p-4 backdrop-blur-md transition-all',
                        getAlertStyle(alert.type),
                        !alert.read && 'ring-2 ring-offset-2 ring-offset-background ring-teal-500/30',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getAlertIcon(alert.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-foreground">{alert.title}</p>
                            <span className="text-[10px] text-muted-foreground">{formatTime(alert.createdAt)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                        </div>
                        {!alert.read && (
                          <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))
              )}
        </motion.div>
      </main>

      <ParentBottomNav alertCount={totalUnread} />
    </div>
  )
}
