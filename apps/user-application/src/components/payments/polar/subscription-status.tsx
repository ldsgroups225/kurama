/**
 * Subscription Status Component
 *
 * Displays the user's current subscription status with management options.
 */

import type { SelectSubscription, SubscriptionTier } from '@kurama/data-ops/drizzle/schema'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CreditCard, Crown, ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCustomerPortalUrl,
  getSubscription,
  getSubscriptionTier,
} from '@/core/functions/payments'
import { cn } from '@/lib/utils'

interface SubscriptionStatusProps {
  className?: string
  showManageButton?: boolean
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Gratuit',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
}

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'bg-muted text-muted-foreground',
  monthly: 'bg-gradient-level text-white',
  quarterly: 'bg-gradient-rare text-white',
  annual: 'bg-gradient-legendary text-white',
}

export function SubscriptionStatus({ className, showManageButton = true }: SubscriptionStatusProps) {
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery<SelectSubscription | null>({
    queryKey: ['subscription'],
    queryFn: () => getSubscription(),
  })

  const { data: tier, isLoading: isLoadingTier } = useQuery({
    queryKey: ['subscription-tier'],
    queryFn: () => getSubscriptionTier(),
  })

  const { data: portalUrl, isLoading: isLoadingPortal } = useQuery({
    queryKey: ['customer-portal-url'],
    queryFn: () => getCustomerPortalUrl(),
    enabled: showManageButton && tier !== 'free',
  })

  const isLoading = isLoadingSubscription || isLoadingTier

  if (isLoading) {
    return <SubscriptionStatusSkeleton className={className} />
  }

  const currentTier = tier || 'free'
  const isPremium = currentTier !== 'free'

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className={cn('h-5 w-5', isPremium ? 'text-level' : 'text-muted-foreground')} />
            Abonnement
          </CardTitle>
          <Badge className={cn('font-medium', TIER_COLORS[currentTier])}>
            {TIER_LABELS[currentTier]}
          </Badge>
        </div>
        <CardDescription>
          {isPremium
            ? 'Vous avez accès à toutes les fonctionnalités premium'
            : 'Passez à un abonnement premium pour débloquer toutes les fonctionnalités'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscription && (
          <div className="space-y-2 text-sm">
            {subscription.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {subscription.cancelAtPeriodEnd
                    ? `Expire le ${formatDate(subscription.currentPeriodEnd)}`
                    : `Renouvellement le ${formatDate(subscription.currentPeriodEnd)}`}
                </span>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Badge variant="outline" className="text-warning border-warning">
                Annulation programmée
              </Badge>
            )}
          </div>
        )}

        {showManageButton && (
          <div className="flex gap-2">
            {isPremium && portalUrl
              ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(portalUrl, '_blank')}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal
                    ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )
                    : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                  Gérer l'abonnement
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )
              : !isPremium && (
                <Button
                  className="w-full bg-gradient-level hover:opacity-90"
                  asChild
                >
                  <a href="/app/polar/subscriptions">
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Premium
                  </a>
                </Button>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionStatusSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
