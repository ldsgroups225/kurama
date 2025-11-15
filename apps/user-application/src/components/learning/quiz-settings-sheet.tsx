import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Target, Zap } from 'lucide-react'

interface QuizSettingsSheetProps {
  open: boolean
  lessonTitle: string
  totalCards: number
  onOpenChange: (open: boolean) => void
  onStartQuiz: (mode: 'memorize-all' | 'review-starred' | 'quick-review') => void
}

export function QuizSettingsSheet({
  open,
  lessonTitle,
  totalCards,
  onOpenChange,
  onStartQuiz,
}: QuizSettingsSheetProps) {
  const learningModes = [
    {
      id: 'memorize-all' as const,
      title: 'Mémoriser tout',
      description: 'Étudie toutes les cartes jusqu\'à la maîtrise complète',
      icon: BookOpen,
      color: 'bg-gradient-xp',
      textColor: 'text-xp',
      badge: 'Recommandé',
      badgeVariant: 'default' as const,
    },
    {
      id: 'review-starred' as const,
      title: 'Réviser les favoris',
      description: 'Concentre-toi sur les cartes que tu as marquées',
      icon: Target,
      color: 'bg-gradient-level',
      textColor: 'text-level',
      badge: 'Ciblé',
      badgeVariant: 'secondary' as const,
    },
    {
      id: 'quick-review' as const,
      title: 'Révision rapide',
      description: 'Parcours rapide de toutes les cartes',
      icon: Zap,
      color: 'bg-gradient-streak',
      textColor: 'text-streak',
      badge: 'Rapide',
      badgeVariant: 'outline' as const,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-hidden rounded-t-3xl p-0"
      >
        <div className="flex h-full flex-col">
          {/* Header Section */}
          <div className="px-6 pt-6">
            <SheetHeader className="p-0 text-left">
              <SheetTitle className="text-2xl">{lessonTitle}</SheetTitle>
              <SheetDescription className="mt-2 text-base">
                Choisissez un objectif pour cette séance d'apprentissage
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="mt-6 space-y-4 pb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>
                  {totalCards}
                  {' '}
                  cartes disponibles
                </span>
              </div>

              {learningModes.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      onStartQuiz(mode.id)
                      onOpenChange(false)
                    }}
                    className="w-full text-left"
                  >
                    <Card
                      className={`
                        group cursor-pointer overflow-hidden border-2
                        transition-all duration-200
                        hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`
                              flex h-14 w-14 shrink-0 items-center justify-center
                              rounded-xl shadow-md transition-transform duration-200
                              group-hover:scale-110
                              ${mode.color}
                            `}
                          >
                            <Icon className="h-7 w-7 text-white" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`
                                  font-semibold transition-colors
                                  group-hover:text-primary
                                `}
                              >
                                {mode.title}
                              </h3>
                              <Badge variant={mode.badgeVariant} className="text-xs">
                                {mode.badge}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {mode.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Section - Fixed at bottom */}
          <div className="border-t bg-background px-6 py-4">
            <SheetFooter className="p-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
