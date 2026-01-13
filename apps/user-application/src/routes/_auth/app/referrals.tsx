/**
 * Referrals Page
 *
 * Displays user's referral code, sharing options, and referral statistics.
 */

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Gift } from 'lucide-react'
import { AppHeader } from '@/components/main'
import { ReferralShareCard, ReferralStats } from '@/components/referrals'

export const Route = createFileRoute('/_auth/app/referrals')({
  component: ReferralsPage,
})

function ReferralsPage() {
  const router = useRouter()

  const handleBack = () => {
    // Check if we can go back in history
    // window.history.length > 2 usually implies we have somewhere to go back to (current + previous + root)
    if (window.history.length > 2) {
      router.history.back()
    } else {
      // Fallback to dashboard
      router.navigate({ to: '/app' })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-info-from/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-xp-from/10 blur-[120px]" />
      </div>

      <AppHeader
        title="Parrainage"
        showBackButton={true}
        onBackClick={handleBack}
        className="bg-transparent/0 border-none relative z-20"
      />

      <div className="container mx-auto max-w-2xl px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-info-from to-xp-to shadow-lg shadow-info-from/25 animate-pulse">
            <Gift className="h-8 w-8 text-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-bold bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Programme de Parrainage
          </h1>
          <p className="text-muted-foreground">
            Invite tes amis et gagnez tous les deux des récompenses !
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Share Card */}
          <ReferralShareCard />

          {/* Stats */}
          <ReferralStats />

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card backdrop-blur-xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Comment ça marche ?</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-from/20 border border-info-from/30 text-sm font-bold text-info-from">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">Partage ton code</p>
                  <p className="text-sm text-muted-foreground">
                    Envoie ton code de parrainage ou ton lien à tes amis
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-from/20 border border-info-from/30 text-sm font-bold text-info-from">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">Ton ami s'inscrit</p>
                  <p className="text-sm text-muted-foreground">
                    Il utilise ton code lors de son inscription et souscrit à un abonnement
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-from/20 border border-info-from/30 text-sm font-bold text-info-from">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">Vous gagnez tous les deux</p>
                  <p className="text-sm text-muted-foreground">
                    Tu reçois
                    {' '}
                    <span className="text-info-from font-semibold">3€</span>
                    {' '}
                    de crédit et ton ami bénéficie d'une réduction
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
