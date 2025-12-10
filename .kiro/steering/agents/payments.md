---
inclusion: fileMatch
fileMatchPattern: "**/*{payment,polar,subscription}*.{ts,tsx}"
---

# Payment Integration Guide (Polar SDK)

## Polar SDK Setup

### Client Configuration
```typescript
import { Polar } from "@polar-sh/sdk"

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
})
```

### Checkout Flow
```typescript
// Create checkout session
const checkout = await polar.checkouts.create({
  productPriceId: "price_xxx",
  successUrl: "https://kurama.yeko.workers.dev/success",
  customerEmail: user.email,
  metadata: {
    userId: user.id,
  },
})

// Redirect to checkout
window.location.href = checkout.url
```

### Webhook Handling
```typescript
import { validateEvent } from "@polar-sh/sdk/webhooks"

app.post("/api/webhooks/polar", async (c) => {
  const payload = await c.req.text()
  const signature = c.req.header("webhook-signature")
  
  const event = validateEvent(payload, signature, webhookSecret)
  
  switch (event.type) {
    case "checkout.created":
      await handleCheckoutCreated(event.data)
      break
    case "subscription.created":
      await handleSubscriptionCreated(event.data)
      break
    case "subscription.canceled":
      await handleSubscriptionCanceled(event.data)
      break
  }
  
  return c.json({ received: true })
})
```

### Subscription Management
```typescript
// Check subscription status
const subscription = await polar.subscriptions.get(subscriptionId)

// Cancel subscription
await polar.subscriptions.cancel(subscriptionId)

// List user subscriptions
const subscriptions = await polar.subscriptions.list({
  customerId: user.polarCustomerId,
})
```

## Frontend Components

### Checkout Button
```tsx
import { Button } from "@/components/ui/button"

export function CheckoutButton({ priceId }: { priceId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const { url } = await createCheckout({ data: priceId })
      window.location.href = url
    } catch (error) {
      toast.error("Erreur lors du paiement")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? "Chargement..." : "S'abonner"}
    </Button>
  )
}
```

### Subscription Status
```tsx
export function SubscriptionStatus() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getSubscription(),
  })
  
  if (isLoading) return <Skeleton />
  
  if (!subscription) {
    return <CheckoutButton priceId="price_xxx" />
  }
  
  return (
    <div className="bg-success p-4 rounded-lg">
      <p>Abonnement actif: {subscription.plan.name}</p>
      <p>Renouvellement: {formatDate(subscription.currentPeriodEnd)}</p>
    </div>
  )
}
```

## Database Schema
```typescript
// Polar-related tables in data-ops
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  polarSubscriptionId: text("polar_subscription_id").unique(),
  status: text("status").notNull(), // active, canceled, past_due
  planId: text("plan_id").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
})
```

## Security Checklist
- [ ] Validate webhook signatures
- [ ] Store Polar tokens securely (env vars)
- [ ] Verify subscription status server-side
- [ ] Handle payment failures gracefully
- [ ] Log all payment events
