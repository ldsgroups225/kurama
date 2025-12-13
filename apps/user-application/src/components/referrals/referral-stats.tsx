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
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
      border: 'border-zinc-500/20',
    },
    {
      label: 'Complétés',
      value: stats?.completedReferrals ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'En attente',
      value: stats?.pendingReferrals ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Gains totaux',
      value: formatCurrency(stats?.totalEarnings ?? 0),
      icon: Coins,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
  ]

  return (
    <Card className={cn('border-white/5 bg-zinc-900/40 backdrop-blur-xl', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Statistiques de parrainage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map(item => (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                item.bg,
                item.border,
              )}
            >
              <item.icon className={cn('h-5 w-5', item.color)} />
              <div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-zinc-400">{item.label}</p>
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
    <Card className={cn('border-white/5 bg-zinc-900/40', className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48 bg-zinc-800" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <Skeleton className="h-5 w-5 rounded bg-zinc-700" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-12 bg-zinc-700" />
                <Skeleton className="h-3 w-16 bg-zinc-700" />
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
