import { useTheme } from '@/components/theme/use-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Monitor, Moon, Palette, Sun } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface ThemeSettingsProps {
  className?: string
}

type Theme = 'light' | 'dark' | 'system'

const themeOptions: { value: Theme, label: string, description: string, icon: typeof Sun }[] = [
  {
    value: 'light',
    label: 'Clair',
    description: 'Thème lumineux pour une utilisation de jour',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Sombre',
    description: 'Thème sombre pour réduire la fatigue oculaire',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'Système',
    description: 'Suit automatiquement les préférences de votre appareil',
    icon: Monitor,
  },
]

export function ThemeSettings({ className }: ThemeSettingsProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Apparence
        </CardTitle>
        <CardDescription>
          Personnalisez l'apparence de l'application selon vos préférences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={theme}
          onValueChange={(value: Theme) => setTheme(value)}
          className="grid gap-3"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <Label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all',
                  'hover:bg-accent/50',
                  isSelected && 'border-primary bg-accent/30',
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`theme-${option.value}`}
                  className="sr-only"
                />
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className={cn(
                    'font-medium leading-none',
                    isSelected && 'text-foreground',
                  )}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </Label>
            )
          })}
        </RadioGroup>

        {/* Current theme indicator */}
        {resolvedTheme && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Thème actuel :</strong>
              {' '}
              {resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}
              {theme === 'system' && ' (automatique)'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
