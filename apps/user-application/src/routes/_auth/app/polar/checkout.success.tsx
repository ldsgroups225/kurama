import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Crown, PartyPopper } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { LogoLoader } from '@/components/ui/logo-loader'
import { collectSubscription, validPayment } from '@/core/functions/payments'
import { authClient } from '@/lib/auth-client'

const searchSchema = z.object({
  checkout_id: z.string(),
})

export const Route = createFileRoute('/_auth/app/polar/checkout/success')({
  component: RouteComponent,
  validateSearch: search => searchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    return search
  },
  loader: async (input) => {
    const isValid = await validPayment({
      data: input.context.checkout_id,
    })
    return {
      isValid,
      checkoutId: input.context.checkout_id,
    }
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Erreur de paiement</h1>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
              Une erreur s'est produite lors du traitement de votre paiement.
            </p>
          </div>

          <div className="pt-8">
            <p className="font-mono text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  },
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const nav = Route.useNavigate()
  const session = authClient.useSession()

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['subscription', session.data?.user?.id, loaderData.checkoutId],
    queryFn: collectSubscription,
    refetchInterval: (query) => {
      if (!query.state.data) {
        return 2000
      }
      return false
    },
  })

  const getStatus = () => {
    if (error)
      return 'error'
    if (data)
      return 'success'
    if (isFetching || isLoading)
      return 'processing'
    return 'processing'
  }

  const status = getStatus()

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-level">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <PartyPopper className="absolute -right-2 -top-2 h-8 w-8 text-level" />
          </div>
        )
      case 'error':
        return <AlertCircle className="h-16 w-16 text-destructive" />
      default:
        return <LogoLoader size="lg" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Bienvenue dans Premium ! 🎉',
          description: 'Ton abonnement a été activé avec succès. Tu as maintenant accès à toutes les fonctionnalités premium.',
        }
      case 'error':
        return {
          title: 'Erreur de traitement',
          description: 'Un problème est survenu lors du traitement de ton paiement. Contacte le support si le problème persiste.',
        }
      default:
        return {
          title: 'Traitement en cours...',
          description: 'Nous vérifions ton paiement. Cela peut prendre quelques instants...',
        }
    }
  }

  const { title, description } = getStatusMessage()

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex justify-center">{getStatusIcon()}</div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="space-y-6">
          {status === 'success' && (
            <div className="space-y-4">
              {/* Premium features unlocked */}
              <div className="rounded-lg bg-linear-to-r from-level/10 to-rare/10 p-4">
                <p className="text-sm font-medium">
                  ✨ Leçons illimitées • Mode hors-ligne • Mode examen • Stats avancées
                </p>
              </div>

              <Button
                onClick={() => nav({ to: '/app' })}
                size="lg"
                className="bg-gradient-level px-8 py-3 hover:opacity-90"
              >
                <Crown className="mr-2 h-4 w-4" />
                Commencer à étudier
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="px-6"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => nav({ to: '/app/polar/subscriptions' })}
                size="lg"
                className="px-6"
              >
                Retour aux offres
              </Button>
            </div>
          )}
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            ID de transaction :
            {' '}
            <span className="font-mono text-foreground">
              {loaderData.checkoutId.slice(-8)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
