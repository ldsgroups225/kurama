import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

export function GoogleLogin() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/app',
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-border bg-card backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mb-6 mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-indigo-500/20">
              <img
                src="/pwa-192x192.png"
                alt="Kurama Logo"
                className="h-12 w-12 rounded-xl"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Content de vous revoir</CardTitle>
            <CardDescription className="text-muted-foreground">Connectez-vous à votre compte pour continuer</CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <Button
              onClick={handleGoogleSignIn}
              className="h-12 w-full text-base font-medium transition-all duration-300 bg-card hover:bg-accent text-foreground border border-border shadow-lg hover:shadow-xl hover:scale-[1.02]"
              variant="default"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GoogleLogin
