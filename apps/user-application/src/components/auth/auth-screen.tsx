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
    <div className={`
      flex min-h-screen items-center justify-center bg-linear-to-br
      from-orange-50 via-white to-orange-50 p-4
      dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950
    `}
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className={`
            mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl
            bg-linear-to-br from-orange-500 to-orange-600 shadow-lg
          `}
          >
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className={`
            mb-2 text-3xl font-bold text-zinc-900
            dark:text-zinc-50
          `}
          >
            Bienvenue sur Kurama
          </h1>
          <p className={`
            text-zinc-600
            dark:text-zinc-400
          `}
          >
            Connectez-vous pour continuer votre apprentissage
          </p>
        </div>

        {/* Auth Card */}
        <div className={`
          rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl
          dark:border-zinc-800 dark:bg-zinc-900
        `}
        >
          <Suspense fallback={(
            <div className="animate-pulse space-y-4">
              <div className="h-10 rounded-sm bg-muted" />
              <div className="h-10 rounded-sm bg-muted" />
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`
                w-full border-t border-zinc-200
                dark:border-zinc-800
              `}
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`
                bg-white px-4 text-zinc-500
                dark:bg-zinc-900 dark:text-zinc-400
              `}
              >
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Social Auth */}
          <SocialAuth />
        </div>

        {/* Footer */}
        <p className={`
          mt-6 text-center text-sm text-zinc-600
          dark:text-zinc-400
        `}
        >
          En continuant, vous acceptez nos
          {' '}
          <button
            type="button"
            className={`
              text-orange-600 underline
              hover:text-orange-700
              dark:text-orange-500 dark:hover:text-orange-400
            `}
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
            className={`
              text-orange-600 underline
              hover:text-orange-700
              dark:text-orange-500 dark:hover:text-orange-400
            `}
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
