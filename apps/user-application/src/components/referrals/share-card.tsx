/**
 * Referral Share Card Component
 *
 * Displays the user's referral code with sharing options.
 */

import { useQuery } from '@tanstack/react-query'
import { Check, Copy, Gift, Share2, Users } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getReferralCode } from '@/core/functions/payments'
import { cn } from '@/lib/utils'

interface ShareCardProps {
  className?: string
}

export function ReferralShareCard({ className }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ['referral-code'],
    queryFn: () => getReferralCode(),
  })

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`
    : ''

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (!navigator.share) {
      handleCopy(referralLink)
      return
    }

    try {
      await navigator.share({
        title: 'Rejoins Kurama !',
        text: 'Utilise mon code de parrainage pour obtenir une réduction sur ton abonnement Kurama.',
        url: referralLink,
      })
    }
    catch (error) {
      // User cancelled or share failed
      console.error('Share failed:', error)
    }
  }

  if (isLoading) {
    return <ReferralShareCardSkeleton className={className} />
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-level" />
          Parrainage
        </CardTitle>
        <CardDescription>
          Invite tes amis et gagne 3€ de crédit pour chaque inscription !
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Ton code de parrainage</span>
          <div className="flex gap-2">
            <Input
              value={referralCode || ''}
              readOnly
              className="font-mono text-center text-lg tracking-wider"
              aria-label="Code de parrainage"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(referralCode || '')}
              aria-label={copied ? 'Copié' : 'Copier le code'}
            >
              {copied
                ? (
                  <Check className="h-4 w-4 text-success" />
                )
                : (
                  <Copy className="h-4 w-4" />
                )}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Lien de parrainage</span>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="text-sm text-muted-foreground"
              aria-label="Lien de parrainage"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(referralLink)}
              aria-label="Copier le lien"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          className="w-full bg-gradient-level hover:opacity-90"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Partager avec mes amis
        </Button>

        {/* Reward Info */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            Tu gagnes
            {' '}
            <span className="font-semibold text-level">3€</span>
            {' '}
            pour chaque ami qui s'abonne !
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ReferralShareCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
