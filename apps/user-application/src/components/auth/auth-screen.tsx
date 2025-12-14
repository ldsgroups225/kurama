import { Suspense, useState } from 'react'
import { createLazyComponent } from '@/lib/lazy-helpers'
import { SocialAuth } from './social-auth'

// Lazy load auth step components
const EmailStep = createLazyComponent(() => import('./email-step'))
const OtpStep = createLazyComponent(() => import('./otp-step'))

type AuthStep = 'email' | 'otp'

export function AuthScreen() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setStep('otp')
  }

  const handleBackToEmail = () => {
    setStep('email')
    setEmail('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-2xl shadow-indigo-500/20">
            <img
              src="/pwa-192x192.png"
              alt="Kurama Logo"
              className="h-16 w-16 rounded-2xl"
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground tracking-tight">
            Bienvenue sur Kurama
          </h1>
          <p className="text-muted-foreground font-medium">
            Connectez-vous pour continuer votre apprentissage
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          <Suspense fallback={(
            <div className="animate-pulse space-y-4">
              <div className="h-10 rounded-xl bg-muted" />
              <div className="h-10 rounded-xl bg-muted" />
            </div>
          )}
          >
            {step === 'email'
              ? (
                  <EmailStep onSubmit={handleEmailSubmit} />
                )
              : (
                  <OtpStep email={email} onBack={handleBackToEmail} />
                )}
          </Suspense>

          {/* Divider */}
          <div className="relative my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-muted-foreground tracking-widest">
              Ou continuer avec
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Auth */}
          <SocialAuth />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          En continuant, vous acceptez nos
          {' '}
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-4"
            onClick={() => {
              // TODO: Navigate to terms page
            }}
          >
            Conditions d'utilisation
          </button>
          {' '}
          et notre
          {' '}
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-4"
            onClick={() => {
              // TODO: Navigate to privacy page
            }}
          >
            Politique de confidentialité
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthScreen
