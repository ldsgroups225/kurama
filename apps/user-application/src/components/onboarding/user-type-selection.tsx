import type { UserType } from '@kurama/data-ops/zod-schema/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, GraduationCap, Users } from '@/lib/icons'

interface UserTypeSelectionProps {
  onSelect: (userType: UserType) => void
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className={`
      flex items-center justify-center bg-linear-to-br from-orange-50 via-white
      to-orange-50 p-4
      dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950
    `}
    >
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="mb-6 text-center">
          <h1 className={`
            mb-3 text-3xl font-bold text-zinc-900
            dark:text-zinc-50
          `}
          >
            Bienvenue sur Kurama
          </h1>
          <p className={`
            text-g text-zinc-600
            dark:text-zinc-400
          `}
          >
            Pour commencer, dites-nous qui vous êtes
          </p>
        </div>

        {/* Selection Cards */}
        <div className={`
          grid gap-4
          md:grid-cols-2
        `}
        >
          {/* Student Card */}
          <Card
            className={`
              group cursor-pointer border-2 bg-white transition-all duration-300
              hover:scale-[1.02] hover:border-orange-500 hover:shadow-2xl
              dark:bg-zinc-900
            `}
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
            <CardContent className="space-y-4 p-6 text-center">
              <div className="flex justify-center">
                <div className={`
                  flex size-20 items-center justify-center rounded-2xl
                  bg-linear-to-br from-orange-500 to-orange-600 shadow-lg
                  transition-shadow
                  group-hover:shadow-orange-500/50
                `}
                >
                  <GraduationCap className="size-10 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className={`
                  text-2xl font-bold text-zinc-900
                  dark:text-zinc-50
                `}
                >
                  Étudiant
                </h2>
                <p className={`
                  text-sm leading-relaxed text-zinc-600
                  dark:text-zinc-400
                `}
                >
                  Je veux apprendre pour réussir mon BEPC ou BAC
                </p>
              </div>
              <Button
                className={`
                  w-full transition-colors
                  group-hover:bg-orange-600
                `}
                size="lg"
              >
                Continuer
                <ArrowRight className={`
                  ml-2 size-4 transition-transform
                  group-hover:translate-x-1
                `}
                />
              </Button>
            </CardContent>
          </Card>

          {/* Parent Card */}
          <Card
            className={`
              group cursor-pointer border-2 bg-white transition-all duration-300
              hover:scale-[1.02] hover:border-orange-500 hover:shadow-2xl
              dark:bg-zinc-900
            `}
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
            <CardContent className="space-y-4 p-6 text-center">
              <div className="flex justify-center">
                <div className={`
                  flex size-20 items-center justify-center rounded-2xl
                  bg-linear-to-br from-blue-500 to-blue-600 shadow-lg
                  transition-shadow
                  group-hover:shadow-blue-500/50
                `}
                >
                  <Users className="size-10 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className={`
                  text-2xl font-bold text-zinc-900
                  dark:text-zinc-50
                `}
                >
                  Parent
                </h2>
                <p className={`
                  text-sm leading-relaxed text-zinc-600
                  dark:text-zinc-400
                `}
                >
                  Je veux suivre la progression de mes enfants
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
              >
                Continuer
                <ArrowRight className={`
                  ml-2 size-4 transition-transform
                  group-hover:translate-x-1
                `}
                />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className={`
          mt-8 text-center text-sm text-zinc-600
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

export default UserTypeSelection
