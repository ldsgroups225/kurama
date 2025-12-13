import { createFileRoute } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { Bell } from 'lucide-react'
import { AppHeader, BottomNav } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { notificationsAtom } from '@/lib/atoms'

export const Route = createFileRoute('/_auth/app/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const [notifications, setNotifications] = useAtom(notificationsAtom)

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[50%] w-[60%] h-[40%] rounded-full bg-yellow-600/5 blur-[120px]" />
      </div>

      <AppHeader title="Notifications" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />

      <main className="container mx-auto max-w-lg px-4 py-6 space-y-4 relative z-10">

        {notifications.length > 0
          ? (
            notifications.map(notif => (
              <Card key={notif.id} className={`border-border backdrop-blur-xl transition-colors ${notif.read ? 'bg-card opacity-80' : 'bg-card border-l-2 border-l-yellow-500 shadow-sm'}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-muted text-muted-foreground' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-2">{notif.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )
          : (
            <div className="text-center py-20">
              <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-muted-foreground">Aucune notification pour le moment</p>
            </div>
          )}

        <div className="flex justify-center pt-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted" onClick={markAllAsRead}>
            Marquer tout comme lu
          </Button>
        </div>

      </main>

      <BottomNav />
    </div>
  )
}
