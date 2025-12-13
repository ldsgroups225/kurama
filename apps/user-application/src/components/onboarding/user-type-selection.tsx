import type { UserType } from '@kurama/data-ops/zod-schema/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, GraduationCap, Users } from '@/lib/icons'

interface UserTypeSelectionProps {
  onSelect: (userType: UserType) => void
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* Logo and Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Bienvenue sur Kurama
          </h1>
          <p className="text-muted-foreground font-medium">
            Pour commencer, dites-nous qui vous êtes
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Card */}
          <Card
            className="group cursor-pointer border-border bg-card backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10"
            onClick={() => onSelect('student')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect('student')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Sélectionner le profil étudiant"
          >
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 transition-transform group-hover:scale-110 duration-300">
                  <GraduationCap className="h-12 w-12 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                  Étudiant
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  Je veux apprendre pour réussir mon BEPC ou BAC
                </p>
              </div>
              <Button
                className="w-full bg-background/50 border border-border hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-300"
                variant="ghost"
                size="lg"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Parent Card */}
          <Card
            className="group cursor-pointer border-border bg-card backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10"
            onClick={() => onSelect('parent')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect('parent')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Sélectionner le profil parent"
          >
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/20 transition-transform group-hover:scale-110 duration-300">
                  <Users className="h-12 w-12 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  Parent
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  Je veux suivre la progression de mes enfants
                </p>
              </div>
              <Button
                className="w-full bg-background/50 border border-border hover:bg-purple-600 hover:border-purple-500 hover:text-white transition-all duration-300"
                variant="ghost"
                size="lg"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground font-medium">
          En continuant, vous acceptez nos
          {' '}
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
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
            className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
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

export default UserTypeSelection
