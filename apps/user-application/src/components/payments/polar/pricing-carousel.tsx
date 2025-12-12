import type { Price, Product, Subscription } from './types'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Gift,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStoredCurrencyRate } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface PricingCarouselProps {
  products: Product[]
  subscription: Subscription
  onCheckout: (productId: string) => void
  isCheckoutPending: boolean
}

// Plan configurations with gamified styling
const PLAN_CONFIGS: Record<string, {
  gradient: string
  bgGradient: string
  icon: typeof Crown
  badge?: string
  badgeClass?: string
  xpBonus: string
  features: string[]
}> = {
  month: {
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-600/10',
    icon: Zap,
    xpBonus: '+50% XP',
    features: [
      'Leçons illimitées',
      'Mode hors-ligne',
      'Statistiques détaillées',
      'Support prioritaire',
    ],
  },
  quarter: {
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 to-purple-600/10',
    icon: Sparkles,
    badge: 'Populaire',
    badgeClass: 'bg-linear-to-r from-violet-500 to-fuchsia-500',
    xpBonus: '+75% XP',
    features: [
      'Tout du plan Mensuel',
      'Mode examen simulé',
      'Badges exclusifs',
      'Économisez 14%',
    ],
  },
  year: {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-400/10 via-yellow-500/10 to-amber-600/10',
    icon: Crown,
    badge: 'Meilleur prix',
    badgeClass: 'bg-linear-to-r from-amber-400 to-orange-500',
    xpBonus: '+100% XP',
    features: [
      'Tout du plan Trimestriel',
      'Accès anticipé nouveautés',
      'Badge Légende',
      'Économisez 28%',
    ],
  },
}

const INTERVAL_LABELS: Record<string, string> = {
  month: 'Mensuel',
  quarter: 'Trimestriel',
  year: 'Annuel',
}

export function PricingCarousel({
  products,
  subscription,
  onCheckout,
  isCheckoutPending,
}: PricingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(1) // Start with middle card (popular)

  const sortedProducts = [...products].sort((a, b) => {
    const aAmount = a.prices[0]?.amountType === 'fixed' ? a.prices[0].priceAmount : 0
    const bAmount = b.prices[0]?.amountType === 'fixed' ? b.prices[0].priceAmount : 0
    return aAmount - bAmount
  })

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => Math.min(sortedProducts.length - 1, prev + 1))
  }, [sortedProducts.length])

  return (
    <div className="w-full">
      {/* Navigation dots */}
      <div className="mb-6 flex justify-center gap-2">
        {sortedProducts.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === activeIndex
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/20 hover:bg-white/40',
            )}
            aria-label={`Voir le plan ${index + 1}`}
          />
        ))}
      </div>

      {/* Carousel container */}
      <div className="relative z-10 overflow-visible px-4">
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={cn(
            'absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white shadow-xl backdrop-blur-md transition-all',
            activeIndex === 0 ? 'opacity-0 scale-75 cursor-not-allowed' : 'opacity-100 hover:bg-black/60 hover:scale-110',
          )}
          aria-label="Plan précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={activeIndex === sortedProducts.length - 1}
          className={cn(
            'absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white shadow-xl backdrop-blur-md transition-all',
            activeIndex === sortedProducts.length - 1 ? 'opacity-0 scale-75 cursor-not-allowed' : 'opacity-100 hover:bg-black/60 hover:scale-110',
          )}
          aria-label="Plan suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Cards */}
        <motion.div
          className="flex gap-4"
          animate={{ x: `calc(-${activeIndex * 100}% - ${activeIndex * 16}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {sortedProducts.map((product, index) => (
            <PricingCarouselCard
              key={product.id}
              product={product}
              subscription={subscription}
              onCheckout={onCheckout}
              isCheckoutPending={isCheckoutPending}
              isActive={index === activeIndex}
            />
          ))}
        </motion.div>
      </div>

      {/* Swipe hint */}
      <p className="mt-6 text-center text-xs font-medium text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <ChevronLeft className="h-3 w-3" />
          Glissez pour voir les autres offres
          <ChevronRight className="h-3 w-3" />
        </span>
      </p>
    </div>
  )
}

interface PricingCarouselCardProps {
  product: Product
  subscription: Subscription
  onCheckout: (productId: string) => void
  isCheckoutPending: boolean
  isActive: boolean
}

function PricingCarouselCard({
  product,
  subscription,
  onCheckout,
  isCheckoutPending,
  isActive,
}: PricingCarouselCardProps) {
  const price = product.prices[0]
  const interval = price?.type === 'recurring' ? (price.recurringInterval ?? 'month') : 'month'
  const defaultConfig: typeof PLAN_CONFIGS[keyof typeof PLAN_CONFIGS] = {
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-600/10',
    icon: Zap,
    xpBonus: '+50% XP',
    features: ['Leçons illimitées', 'Mode hors-ligne', 'Statistiques détaillées', 'Support prioritaire'],
  }
  const config = PLAN_CONFIGS[interval] ?? defaultConfig
  const Icon = config.icon

  const isCurrentPlan = subscription && price && subscription.productId === price.productId
  const [xofRate, setXofRate] = useState(getStoredCurrencyRate())

  useEffect(() => {
    // Update rate on mount/client-side to ensure accuracy
    setXofRate(getStoredCurrencyRate())
  }, [])

  const formatPrice = (priceData: Price | undefined) => {
    if (!priceData || priceData.amountType !== 'fixed' || !priceData.priceAmount) {
      return { amount: '—', currency: '' }
    }

    // Convert to XOF
    const amount = (priceData.priceAmount / 100) * xofRate

    return {
      amount: new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount),
      currency: 'F CFA',
    }
  }

  const { amount, currency } = formatPrice(price)

  const getIntervalLabel = () => {
    if (!price || price.type !== 'recurring' || !price.recurringInterval)
      return ''
    const intervalMap: Record<string, string> = {
      month: '/mois',
      quarter: '/trimestre',
      year: '/an',
    }
    return intervalMap[price.recurringInterval] ?? ''
  }

  const getFeatures = () => {
    const metadataFeatures = Object.entries(product.metadata || {})
      .filter(([key]) => key.includes('feature'))
      .map(([, value]) => String(value))

    return metadataFeatures.length > 0 ? metadataFeatures : config.features
  }

  const features = getFeatures()

  return (
    <motion.div
      className={cn(
        'relative min-w-full shrink-0 rounded-3xl border p-6 transition-all duration-300',
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60 blur-[1px]',
        isCurrentPlan
          ? 'border-emerald-500/50 bg-emerald-900/10'
          : 'border-white/10 bg-zinc-900/40 backdrop-blur-xl',
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className={cn(
          'absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-20 blur-[60px]',
          `bg-linear-to-br ${config.gradient}`,
        )}
        />
      </div>

      {/* Badge */}
      {config.badge && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className={cn('border-0 px-3 py-1 text-white shadow-lg backdrop-blur-md', config.badgeClass)}>
            <Star className="mr-1 h-3 w-3 fill-current" />
            {config.badge}
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="border-0 bg-emerald-500 px-3 py-1 text-white shadow-lg">
            <Check className="mr-1 h-3 w-3" />
            Plan actuel
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center">
        <div className={cn(
          'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg shadow-black/20',
          config.gradient,
        )}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>

        <h3 className="mb-1 text-xl font-bold text-white">
          {INTERVAL_LABELS[interval] ?? product.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-6 text-center">
        <div className="flex items-baseline justify-center gap-1 text-white">
          <span className="text-4xl font-bold">{amount}</span>
          <span className="text-2xl font-semibold">{currency}</span>
          <span className="text-zinc-400">{getIntervalLabel()}</span>
        </div>

        {/* XP Bonus badge */}
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm font-medium text-amber-400 border border-amber-500/20">
          <Flame className="h-4 w-4 fill-current" />
          {config.xpBonus}
        </div>
      </div>

      {/* Features */}
      <div className="mb-8 space-y-3">
        {features.map((feature: string, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <div className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br',
              config.gradient,
            )}
            >
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      {isCurrentPlan
        ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
              asChild
            >
              <a href="/app/polar/portal">
                <Shield className="mr-2 h-4 w-4" />
                Gérer l'abonnement
              </a>
            </Button>
          </div>
        )
        : (
          <Button
            className={cn(
              'w-full bg-linear-to-r text-white shadow-lg transition-all hover:opacity-90 hover:scale-[1.02] hover:shadow-xl',
              config.gradient,
            )}
            size="lg"
            disabled={isCheckoutPending || !price}
            onClick={() => price && onCheckout(price.productId)}
          >
            {isCheckoutPending
              ? (
                <>
                  <Rocket className="mr-2 h-4 w-4 animate-pulse" />
                  Chargement...
                </>
              )
              : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {subscription ? 'Changer de plan' : 'Commencer l\'essai gratuit'}
                </>
              )}
          </Button>
        )}

      {/* Trial info */}
      {!subscription && !isCurrentPlan && (
        <p className="mt-3 flex items-center justify-center text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
          <Gift className="mr-1 h-3 w-3" />
          7 jours gratuits • Sans engagement
        </p>
      )}
    </motion.div>
  )
}
