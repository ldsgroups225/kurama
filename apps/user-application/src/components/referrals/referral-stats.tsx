/**
 * Referral Stats Component
 *
 * Displays the user's referral statistics.
 */

import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, Coins, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getReferralStatistics } from '@/core/functions/payments'
import { cn } from '@/lib/utils'

interface ReferralStatsProps {
  className?: string
}

export function ReferralStats({ className }: ReferralStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => getReferralStatistics(),
  })

  if (isLoading) {
    return <ReferralStatsSkeleton className={className} />
  }

  const statItems = [
    {
      label: 'Total parrainages',
      value: stats?.totalReferrals ?? 0,
      icon: Users,
      color: 'text-muted-foreground',
    },
    {
      label: 'Complétés',
      value: stats?.completedReferrals ?? 0,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'En attente',
      value: stats?.pendingReferrals ?? 0,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Gains totaux',
      value: formatCurrency(stats?.totalEarnings ?? 0),
      icon: Coins,
      color: 'text-level',
    },
  ]

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Statistiques de parrainage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map(item => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <item.icon className={cn('h-5 w-5', item.color)} />
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReferralStatsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(cents: number): string {
  const euros = cents / 100
  return `${euros.toFixed(2)}€`
}
