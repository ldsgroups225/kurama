import { createFileRoute } from '@tanstack/react-router'
import { MessageCircle, Plus, Users } from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/groups')({
  component: GroupsPage,
})

const groups = [
  {
    name: 'BAC Maths 2024',
    members: 24,
    messages: 156,
    lastActivity: 'Il y a 2h',
    color: 'bg-gradient-xp',
  },
  {
    name: 'BEPC Sciences',
    members: 18,
    messages: 89,
    lastActivity: 'Il y a 5h',
    color: 'bg-gradient-epic',
  },
  {
    name: 'Groupe Abidjan',
    members: 32,
    messages: 234,
    lastActivity: 'Il y a 1j',
    color: 'bg-gradient-success',
  },
]

function GroupsPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-groups')
    return endTracking
  }, [])

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Groupes d'Étude" showAvatar={false} />

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Créer un Groupe
        </Button>

        <div className="space-y-3">
          {groups.map(group => (
            <Card
              key={group.name}
              className={`
                transition-shadow
                hover:shadow-md
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className={`
                    h-12 w-12
                    ${group.color}
                  `}
                  >
                    <AvatarFallback className="font-bold text-white">
                      <Users className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">
                      {group.name}
                    </h3>
                    <div className={`
                      flex items-center gap-3 text-xs text-muted-foreground
                    `}
                    >
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {group.messages}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      Actif
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {group.lastActivity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
