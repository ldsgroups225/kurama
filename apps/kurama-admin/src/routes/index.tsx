import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme'
import { checkAuth } from '@/core/functions/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try {
      await checkAuth()
      // If auth check succeeds, redirect to dashboard
      throw redirect({
        to: '/dashboard',
      })
    }
    catch (e) {
      // If it's a redirect (from the line above), rethrow it
      if (e instanceof Response || (typeof e === 'object' && e !== null && 'to' in e)) {
        throw e
      }
      // Otherwise, user is not authenticated, stay on login page
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Kurama" className="h-9 w-9 rounded-lg" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight">Kurama</span>
              <span className="text-xs text-muted-foreground">Panneau Admin</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenue</h1>
            <p className="text-muted-foreground">Connectez-vous pour gérer votre contenu éducatif</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
