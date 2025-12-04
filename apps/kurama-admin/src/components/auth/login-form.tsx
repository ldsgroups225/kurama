import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

export function LoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })

      if (otpError) {
        setError(otpError.message || 'Erreur lors de l\'envoi du code')
        setIsLoading(false)
        return
      }

      setStep('otp')
      setIsLoading(false)
    } catch {
      setError('Impossible d\'envoyer le code. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (signInError) {
        setError(signInError.message || 'Code invalide')
        setIsLoading(false)
        return
      }

      // Success
      await router.invalidate()
      await router.navigate({ to: '/dashboard' })
    } catch {
      setError('Une erreur s\'est produite. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connexion Administrateur</CardTitle>
          <CardDescription>Entrez votre adresse e-mail pour accéder au panneau d'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse E-mail</Label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kurama.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continuer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Code de Vérification</CardTitle>
        <CardDescription>Entrez le code envoyé à {email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Code OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Vérifier et Connexion'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep('email')}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'e-mail
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
