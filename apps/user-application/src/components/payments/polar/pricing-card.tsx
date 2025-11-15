import type { Price, Product, Subscription } from './types'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { generateUUID } from '@/utils/generateUUID'

interface PricingCardProps {
  product: Product
  subscription: Subscription
  onCheckout: (productId: string) => void
  isCheckoutPending: boolean
}

export function PricingCard({
  product,
  subscription,
  onCheckout,
  isCheckoutPending,
}: PricingCardProps) {
  const price = product.prices[0]

  const formatPrice = (price: Price) => {
    if (!price) {
      return 'Price unavailable'
    }
    if (price.type !== 'recurring') {
      return 'Currency not specified'
    }

    if (price.amountType === 'fixed' && price.priceAmount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.priceCurrency.toUpperCase(),
      }).format(price.priceAmount / 100)
    }

    if (price.amountType === 'custom') {
      const min = price.minimumAmount ? price.minimumAmount / 100 : 0
      const max = price.maximumAmount ? price.maximumAmount / 100 : null
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.priceCurrency.toUpperCase(),
      })

      if (max) {
        return `${formatter.format(min)} - ${formatter.format(max)}`
      }
      return `From ${formatter.format(min)}`
    }

    return 'Custom pricing'
  }

  const getFeatures = (metadata: Record<string, any>) => {
    return Object.entries(metadata)
      .filter(([key]) => key.includes('feature'))
      .map(([, value]) => value)
  }

  const features = getFeatures(product.metadata)

  const renderButton = () => {
    if (subscription) {
      if (price && subscription.productId === price.productId) {
        return (
          <div className="space-y-2">
            <div className="text-center">
              <Badge variant="default" className="mb-2">
                Current Plan
              </Badge>
              <p className="text-sm text-muted-foreground">
                Status:
                {' '}
                {subscription.status}
              </p>
            </div>
            <Button asChild className="w-full" size="lg" variant="outline">
              <a href="/app/polar/portal">Manage Subscription</a>
            </Button>
          </div>
        )
      }
      else {
        return (
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Manage your subscription in the portal
            </p>
            <Button asChild className="w-full" size="lg" variant="secondary">
              <a href="/app/polar/portal">Go to Portal</a>
            </Button>
          </div>
        )
      }
    }

    if (!price) {
      return (
        <Button disabled className="w-full" size="lg">
          Price Unavailable
        </Button>
      )
    }

    return (
      <Button
        disabled={isCheckoutPending}
        onClick={() => onCheckout(price.productId)}
        className="w-full"
        size="lg"
      >
        Get Started
      </Button>
    )
  }

  return (
    <Card key={product.id} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {product.isRecurring && (
            <Badge variant="secondary">{product.recurringInterval}</Badge>
          )}
        </div>
        {product.description && (
          <CardDescription>{product.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="text-3xl font-bold">{price ? formatPrice(price) : 'Price unavailable'}</div>
          {price && price.type === 'recurring' && (
            <div className="text-sm text-muted-foreground">
              per
              {' '}
              {price.recurringInterval}
            </div>
          )}
        </div>

        {features.length > 0 && (
          <div className="mb-6 space-y-3">
            {features.map(feature => (
              <div key={generateUUID()} className="flex items-start gap-2">
                <Check className="text-success mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {renderButton()}
      </CardContent>
    </Card>
  )
}
