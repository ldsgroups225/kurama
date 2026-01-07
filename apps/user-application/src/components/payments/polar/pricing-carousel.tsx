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
  Star,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useState } from 'react'
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
    icon: Star,
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
        {sortedProducts.map((product, index) => (
          <button
            key={product.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === activeIndex
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-primary/20 hover:bg-primary/40',
            )}
            aria-label={`Voir le plan ${index + 1}`}
          />
        ))}
      </div>

      {/* Carousel container */}
      <div className="relative z-10 px-4">
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={cn(
            'absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background/80 p-3 text-foreground shadow-xl backdrop-blur-md transition-all',
            activeIndex === 0 ? 'opacity-0 scale-75 cursor-not-allowed' : 'opacity-100 hover:bg-background hover:scale-110',
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
            'absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background/80 p-3 text-foreground shadow-xl backdrop-blur-md transition-all',
            activeIndex === sortedProducts.length - 1 ? 'opacity-0 scale-75 cursor-not-allowed' : 'opacity-100 hover:bg-background hover:scale-110',
          )}
          aria-label="Plan suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Cards - show only active card */}
        <div className="relative">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={false}
              animate={{
                opacity: index === activeIndex ? 1 : 0,
                scale: index === activeIndex ? 1 : 0.95,
                position: index === activeIndex ? 'relative' : 'absolute',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn(
                'w-full',
                index !== activeIndex && 'pointer-events-none inset-0',
              )}
              aria-hidden={index !== activeIndex}
            >
              <PricingCarouselCard
                product={product}
                subscription={subscription}
                onCheckout={onCheckout}
                isCheckoutPending={isCheckoutPending}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Swipe hint */}
      <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
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
}

function PricingCarouselCard({
  product,
  subscription,
  onCheckout,
  isCheckoutPending,
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
  const [xofRate] = useState(() => getStoredCurrencyRate())

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
    <div
      className={cn(
        'relative w-full rounded-3xl border p-6 transition-all duration-300',
        isCurrentPlan
          ? 'border-emerald-500/50 bg-emerald-900/10 dark:bg-emerald-900/20'
          : 'border-border bg-card/80 backdrop-blur-xl',
      )}
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

        <h3 className="mb-1 text-xl font-bold text-foreground">
          {INTERVAL_LABELS[interval] ?? product.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-6 text-center">
        <div className="flex items-baseline justify-center gap-1 text-foreground">
          <span className="text-4xl font-bold">{amount}</span>
          <span className="text-2xl font-semibold">{currency}</span>
          <span className="text-muted-foreground">{getIntervalLabel()}</span>
        </div>

        {/* XP Bonus badge */}
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Flame className="h-4 w-4 fill-current" />
          {config.xpBonus}
        </div>
      </div>

      {/* Features */}
      <div className="mb-8 space-y-3">
        {features.map((feature: string) => (
          <div key={feature} className="flex items-start gap-3">
            <div className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br',
              config.gradient,
            )}
            >
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      {isCurrentPlan
        ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
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
        <p className="mt-3 flex items-center justify-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          <Gift className="mr-1 h-3 w-3" />
          7 jours gratuits • Sans engagement
        </p>
      )}
    </div>
  )
}
