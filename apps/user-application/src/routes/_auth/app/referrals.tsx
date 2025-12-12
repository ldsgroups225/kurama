/**
 * Referrals Page
 *
 * Displays user's referral code, sharing options, and referral statistics.
 */

import { createFileRoute } from '@tanstack/react-router'
import { Gift } from 'lucide-react'
import { ReferralShareCard, ReferralStats } from '@/components/referrals'

export const Route = createFileRoute('/_auth/app/referrals')({
  component: ReferralsPage,
})

function ReferralsPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-level">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Programme de Parrainage</h1>
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
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Comment ça marche ?</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-level text-sm font-bold text-white">
                1
              </span>
              <div>
                <p className="font-medium">Partage ton code</p>
                <p className="text-sm text-muted-foreground">
                  Envoie ton code de parrainage ou ton lien à tes amis
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-level text-sm font-bold text-white">
                2
              </span>
              <div>
                <p className="font-medium">Ton ami s'inscrit</p>
                <p className="text-sm text-muted-foreground">
                  Il utilise ton code lors de son inscription et souscrit à un abonnement
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-level text-sm font-bold text-white">
                3
              </span>
              <div>
                <p className="font-medium">Vous gagnez tous les deux</p>
                <p className="text-sm text-muted-foreground">
                  Tu reçois 3€ de crédit et ton ami bénéficie d'une réduction
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
