/**
 * Subscription Badge Component
 *
 * A compact badge showing the user's subscription tier.
 */

import type { SubscriptionTier } from '@kurama/data-ops/drizzle/schema'
import { Crown, Sparkles, Star, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps {
  tier: SubscriptionTier
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const TIER_CONFIG: Record<SubscriptionTier, {
  label: string
  icon: typeof Crown
  className: string
}> = {
  free: {
    label: 'Gratuit',
    icon: Star,
    className: 'bg-muted text-muted-foreground border-muted',
  },
  monthly: {
    label: 'Premium',
    icon: Zap,
    className: 'bg-gradient-level text-white border-transparent',
  },
  quarterly: {
    label: 'Premium+',
    icon: Sparkles,
    className: 'bg-gradient-rare text-white border-transparent',
  },
  annual: {
    label: 'Premium Pro',
    icon: Crown,
    className: 'bg-gradient-legendary text-white border-transparent',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
}

const ICON_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

export function SubscriptionBadge({
  tier,
  size = 'md',
  showIcon = true,
  className,
}: SubscriptionBadgeProps) {
  const config = TIER_CONFIG[tier]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium gap-1',
        SIZE_CLASSES[size],
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className={ICON_SIZES[size]} />}
      {config.label}
    </Badge>
  )
}

/**
 * Inline subscription indicator (just icon + minimal text)
 */
export function SubscriptionIndicator({
  tier,
  className,
}: {
  tier: SubscriptionTier
  className?: string
}) {
  if (tier === 'free')
    return null

  const config = TIER_CONFIG[tier]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 text-level', className)}>
      <Icon className="h-4 w-4" />
    </span>
  )
}
