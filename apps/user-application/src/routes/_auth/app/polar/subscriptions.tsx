import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Crown, Gift, Shield, Sparkles, Zap } from 'lucide-react'
import { PricingGrid, SubscriptionStatus, useCheckout } from '@/components/payments/polar'
import { Button } from '@/components/ui/button'
import { collectSubscription, getProducts, getSubscriptionTier } from '@/core/functions/payments'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/app/polar/subscriptions')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: getProducts,
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['subscription'],
        queryFn: collectSubscription,
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['subscription-tier'],
        queryFn: getSubscriptionTier,
      }),
    ])
  },
})

const PREMIUM_FEATURES = [
  {
    icon: Zap,
    title: 'Leçons illimitées',
    description: 'Accède à toutes les leçons sans restriction',
  },
  {
    icon: Shield,
    title: 'Mode hors-ligne',
    description: 'Étudie même sans connexion internet',
  },
  {
    icon: Sparkles,
    title: 'Mode examen',
    description: 'Simule les conditions réelles du BEPC/BAC',
  },
  {
    icon: Crown,
    title: 'Statistiques avancées',
    description: 'Suis ta progression en détail',
  },
]

function RouteComponent() {
  const session = authClient.useSession()

  const { data: products } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
  })

  const { data: subscription } = useSuspenseQuery({
    queryKey: ['subscription', session.data?.user?.id],
    queryFn: collectSubscription,
    refetchOnWindowFocus: true,
  })

  const { data: tier } = useSuspenseQuery({
    queryKey: ['subscription-tier'],
    queryFn: getSubscriptionTier,
  })

  const { redirectToCheckout, isCheckoutPending } = useCheckout()

  const isPremium = tier !== 'free'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link to="/app">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-level">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">
          {isPremium ? 'Gérer mon abonnement' : 'Passer à Premium'}
        </h1>
        <p className="text-muted-foreground">
          {isPremium
            ? 'Merci de soutenir Kurama ! Voici les détails de ton abonnement.'
            : 'Débloquez toutes les fonctionnalités pour réussir vos examens'}
        </p>
      </div>

      {/* Current subscription status (if premium) */}
      {isPremium && (
        <div className="mb-8">
          <SubscriptionStatus showManageButton />
        </div>
      )}

      {/* Features grid (if not premium) */}
      {!isPremium && (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREMIUM_FEATURES.map(feature => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-level">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1 font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trial info banner */}
      {!isPremium && (
        <div className="mb-8 rounded-lg bg-linear-to-r from-level/10 to-rare/10 p-4 text-center">
          <p className="font-medium">
            🎉 Essai gratuit de 7 jours sur tous les abonnements !
          </p>
          <p className="text-sm text-muted-foreground">
            Annulez à tout moment pendant la période d'essai
          </p>
        </div>
      )}

      {/* Pricing grid */}
      <PricingGrid
        products={products}
        subscription={subscription}
        onCheckout={redirectToCheckout}
        isCheckoutPending={isCheckoutPending}
      />

      {/* Referral link */}
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link to="/app/referrals">
            <Gift className="mr-2 h-4 w-4" />
            Parrainez un ami et gagnez 3€
          </Link>
        </Button>
      </div>
    </div>
  )
}
