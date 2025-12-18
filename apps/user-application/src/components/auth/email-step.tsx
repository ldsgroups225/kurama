import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { useReferral } from '@/hooks/use-referral'
import { Loader2, Mail } from '@/lib/icons'

interface EmailStepProps {
  onSubmit: (email: string) => void
}

export function EmailStep({ onSubmit }: EmailStepProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { getCurrentReferralCode } = useReferral()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)

    try {
      // Get referral code from storage
      const referralCode = getCurrentReferralCode()

      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
        ...(referralCode && { referralCode }),
      })

      if (otpError) {
        setError(otpError.message || 'Une erreur s\'est produite')
        setIsLoading(false)
        return
      }

      onSubmit(email)
    }
    catch {
      setError('Impossible d\'envoyer le code. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-foreground"
        >
          Adresse email
        </Label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading
          ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          )
          : (
            'Continuer'
          )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Nous vous enverrons un code de vérification à 6 chiffres
      </p>
    </form>
  )
}

export default EmailStep
