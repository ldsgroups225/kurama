import { ChevronDown, ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface TestSettings {
  questionCount: number
  instantCorrection: boolean
  answerWith: 'term' | 'definition' | 'both'
  cardSide: 'term' | 'definition'
  trueFalse: boolean
  multipleChoice: boolean
  written: boolean
}

interface TestSettingsSheetProps {
  open: boolean
  lessonTitle: string
  totalCards: number
  onOpenChange: (open: boolean) => void
  onStartTest: (settings: TestSettings) => void
}

export function TestSettingsSheet({
  open,
  lessonTitle,
  totalCards,
  onOpenChange,
  onStartTest,
}: TestSettingsSheetProps) {
  const maxQuestions = Math.min(totalCards, 60)

  const [settings, setSettings] = useState<TestSettings>({
    questionCount: Math.min(20, maxQuestions),
    instantCorrection: false,
    answerWith: 'term',
    cardSide: 'term',
    trueFalse: false,
    multipleChoice: true,
    written: false,
  })

  const [expandedCardSide, setExpandedCardSide] = useState(false)

  const handleStartTest = () => {
    // Ensure at least one question type is selected
    if (!settings.trueFalse && !settings.multipleChoice && !settings.written) {
      return
    }
    onStartTest(settings)
    onOpenChange(false)
  }

  const hasAtLeastOneType = settings.trueFalse || settings.multipleChoice || settings.written

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
              <div className="flex items-center gap-3">
                <div className="bg-gradient-streak flex h-12 w-12 items-center justify-center rounded-xl">
                  <ClipboardCheck className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <SheetTitle className="text-2xl">{lessonTitle}</SheetTitle>
                  <SheetDescription className="text-base">
                    Configurez votre test
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="mt-6 space-y-6 pb-6">
              {/* Question Count */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Nombre de questions
                    {' '}
                    <span className="text-sm text-muted-foreground">
                      (max
                      {' '}
                      {maxQuestions}
                      )
                    </span>
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {settings.questionCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={maxQuestions}
                  step="5"
                  value={settings.questionCount}
                  onChange={e =>
                    setSettings({ ...settings, questionCount: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Instant Correction Toggle */}
              <div className="flex items-center justify-between rounded-lg border-2 p-4">
                <div className="flex-1">
                  <Label htmlFor="instant-correction" className="text-base font-medium">
                    Correction instantanée
                  </Label>
                </div>
                <Switch
                  id="instant-correction"
                  checked={settings.instantCorrection}
                  onCheckedChange={checked =>
                    setSettings({ ...settings, instantCorrection: checked })}
                />
              </div>

              {/* Answer With Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Répondre avec :</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, answerWith: 'term' })}
                    className={cn(
                      `
                        rounded-lg border-2 p-4 text-left transition-all
                        hover:border-primary/50
                      `,
                      settings.answerWith === 'term'
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                    )}
                  >
                    <div className="font-medium text-sm">Terme</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, answerWith: 'definition' })}
                    className={cn(
                      `
                        rounded-lg border-2 p-4 text-left transition-all
                        hover:border-primary/50
                      `,
                      settings.answerWith === 'definition'
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                    )}
                  >
                    <div className="font-medium text-sm">Définition</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, answerWith: 'both' })}
                    className={cn(
                      `
                        rounded-lg border-2 p-4 text-left transition-all
                        hover:border-primary/50
                      `,
                      settings.answerWith === 'both'
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                    )}
                  >
                    <div className="font-medium text-sm">Les deux</div>
                  </button>
                </div>
              </div>

              {/* Card Side Selection - Expandable */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setExpandedCardSide(!expandedCardSide)}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-border p-4 transition-all hover:border-primary/50"
                >
                  <Label className="text-base font-medium cursor-pointer">
                    Côté de la carte
                  </Label>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-transform',
                      expandedCardSide && 'rotate-180',
                    )}
                  />
                </button>

                {expandedCardSide && (
                  <div className="grid grid-cols-2 gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, cardSide: 'term' })}
                      className={cn(
                        `
                          rounded-lg border-2 p-4 text-left transition-all
                          hover:border-primary/50
                        `,
                        settings.cardSide === 'term'
                          ? 'border-primary bg-primary/10'
                          : 'border-border',
                      )}
                    >
                      <div className="font-medium text-sm">Terme</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, cardSide: 'definition' })}
                      className={cn(
                        `
                          rounded-lg border-2 p-4 text-left transition-all
                          hover:border-primary/50
                        `,
                        settings.cardSide === 'definition'
                          ? 'border-primary bg-primary/10'
                          : 'border-border',
                      )}
                    >
                      <div className="font-medium text-sm">Définition</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Question Types */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Types de questions</Label>

                <div className="space-y-3">
                  {/* True/False */}
                  <div className="flex items-center justify-between rounded-lg border-2 p-4">
                    <div className="flex-1">
                      <Label htmlFor="true-false" className="text-base font-medium">
                        Vrai ou faux
                      </Label>
                    </div>
                    <Switch
                      id="true-false"
                      checked={settings.trueFalse}
                      onCheckedChange={checked =>
                        setSettings({ ...settings, trueFalse: checked })}
                    />
                  </div>

                  {/* Multiple Choice */}
                  <div className="flex items-center justify-between rounded-lg border-2 p-4">
                    <div className="flex-1">
                      <Label htmlFor="multiple-choice" className="text-base font-medium">
                        Choix multiple
                      </Label>
                    </div>
                    <Switch
                      id="multiple-choice"
                      checked={settings.multipleChoice}
                      onCheckedChange={checked =>
                        setSettings({ ...settings, multipleChoice: checked })}
                    />
                  </div>

                  {/* Written */}
                  <div className="flex items-center justify-between rounded-lg border-2 p-4">
                    <div className="flex-1">
                      <Label htmlFor="written" className="text-base font-medium">
                        Écrit
                      </Label>
                    </div>
                    <Switch
                      id="written"
                      checked={settings.written}
                      onCheckedChange={checked =>
                        setSettings({ ...settings, written: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section - Fixed at bottom */}
          <div className="border-t bg-background px-6 py-4">
            <Button
              size="lg"
              className="w-full bg-gradient-streak text-lg font-semibold"
              onClick={handleStartTest}
              disabled={!hasAtLeastOneType}
            >
              Commencer le test
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
