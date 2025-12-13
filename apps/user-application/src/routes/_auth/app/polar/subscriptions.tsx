import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Flame,
  Gift,
  Trophy,
  Wifi,
} from 'lucide-react'
import { motion } from 'motion/react'
import { PricingCarousel, SubscriptionStatus, useCheckout } from '@/components/payments/polar'
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
    icon: BookOpen,
    title: 'Leçons illimitées',
    description: 'Accède à tout le contenu disponible sur la plateforme sans aucune restriction.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0.1,
  },
  {
    icon: Wifi,
    title: 'Mode hors-ligne',
    description: 'Télécharges tes cours préférés et continue d\'apprendre même sans internet.',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.2,
  },
  {
    icon: Trophy,
    title: 'Mode examen',
    description: 'Prépare tes examens avec des simulations réalistes du BEPC et BAC.',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0.3,
  },
  {
    icon: Flame,
    title: 'Bonus XP',
    description: 'Gagne deux fois plus d\'expérience et monte plus vite dans le classement.',
    gradient: 'from-orange-500 to-red-500',
    delay: 0.4,
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
    <div className="relative min-h-screen bg-background pb-12 text-foreground">
      {/* Aurora Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[10%] h-[70vw] w-[70vw] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute -right-[20%] top-[20%] h-[60vw] w-[60vw] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[30%] h-[50vw] w-[50vw] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        {/* Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-border bg-card/50 text-muted-foreground hover:bg-accent hover:text-foreground" asChild>
            <Link to="/app/profile">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          {isPremium && (
            <div className="rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 px-3 py-1">
              <span className="bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-xs font-bold text-transparent">
                PREMIUM ACTIF
              </span>
            </div>
          )}
        </motion.div>

        {/* Hero */}
        <motion.div
          className="relative mb-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-amber-400 via-orange-500 to-red-600 shadow-glow-warning"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1.5 }}
          >
            <Crown className="h-12 w-12 text-white drop-shadow-md" />
          </motion.div>

          <h1 className="mb-3 text-4xl font-black tracking-tight">
            {isPremium
              ? (
                  <span className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    L'élite de Kurama
                  </span>
                )
              : (
                  <span>
                    Deviens
                    {' '}
                    <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      Premium
                    </span>
                  </span>
                )}
          </h1>
          <p className="mx-auto max-w-[280px] text-lg font-medium text-muted-foreground">
            {isPremium
              ? 'Profite de ton apprentissage sans limites.'
              : 'Débloque tout le potentiel et apprends 3x plus vite.'}
          </p>
        </motion.div>

        {/* Current Subs */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl"
          >
            <SubscriptionStatus showManageButton />
          </motion.div>
        )}

        {/* Features Grid */}
        {!isPremium && (
          <div className="mb-12 grid grid-cols-1 gap-4">
            {PREMIUM_FEATURES.map(feature => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: feature.delay }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-1 backdrop-blur-md transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-4 p-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${feature.gradient} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-snug">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative min-h-[400px]"
        >
          {/* Trial Banner */}
          {!isPremium && !subscription && (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 py-1.5 text-center text-xs font-bold text-amber-500">
              <Gift className="h-3 w-3" />
              7 JOURS D'ESSAI GRATUIT
            </div>
          )}

          <PricingCarousel
            products={products}
            subscription={subscription}
            onCheckout={redirectToCheckout}
            isCheckoutPending={isCheckoutPending}
          />

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Paiement sécurisé • Annulation à tout moment
          </p>
        </motion.div>

        {/* Referral */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Link
            to="/app/referrals"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Gift className="h-4 w-4" />
            Parraine un ami et gagne 3€
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
