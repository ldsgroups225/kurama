import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useVibration, VibrationPatterns } from '@/hooks'
import { Smartphone, Volume2, VolumeX } from '@/lib/icons'

interface VibrationSettingsProps {
  className?: string
}

export function VibrationSettings({ className }: VibrationSettingsProps) {
  const [{ isSupported }, { vibrate }] = useVibration()
  const [isEnabled, setIsEnabled] = useState(true)
  const [intensity, setIntensity] = useState([75])

  // Test vibration patterns
  const testPatterns = [
    { name: 'XP Gain', pattern: VibrationPatterns.xpGain(50), description: 'Gain d\'expérience' },
    { name: 'Level Up', pattern: VibrationPatterns.levelUp, description: 'Montée de niveau' },
    { name: 'Achievement', pattern: VibrationPatterns.achievement.rare, description: 'Succès rare' },
    { name: 'Streak', pattern: VibrationPatterns.streak.x5, description: 'Série de 5' },
    { name: 'Quiz Complete', pattern: VibrationPatterns.quizComplete(85), description: 'Quiz terminé' },
  ]

  const handleTestVibration = (pattern: number | number[]) => {
    if (!isSupported || !isEnabled)
      return

    // Apply intensity scaling
    const intensityMultiplier = (intensity[0] ?? 75) / 100
    let adjustedPattern: number | number[]

    if (Array.isArray(pattern)) {
      adjustedPattern = pattern.map(duration => Math.round(duration * intensityMultiplier))
    }
    else {
      adjustedPattern = Math.round(pattern * intensityMultiplier)
    }

    vibrate(adjustedPattern)
  }

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5" />
            Vibrations
          </CardTitle>
          <CardDescription>
            Les vibrations ne sont pas supportées sur cet appareil.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Vibrations
        </CardTitle>
        <CardDescription>
          Configurez les retours haptiques pour améliorer votre expérience d'apprentissage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="vibration-enabled">Activer les vibrations</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des retours haptiques lors des interactions
            </p>
          </div>
          <Switch
            id="vibration-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {/* Intensity Slider */}
        {isEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration-intensity">Intensité</Label>
              <span className="text-sm text-muted-foreground">
                {intensity[0] ?? 75}
                %
              </span>
            </div>
            <Slider
              id="vibration-intensity"
              min={10}
              max={100}
              step={10}
              value={intensity}
              onValueChange={setIntensity}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Ajustez l'intensité des vibrations selon vos préférences
            </p>
          </div>
        )}

        {/* Test Patterns */}
        {isEnabled && (
          <div className="space-y-3">
            <Label>Tester les vibrations</Label>
            <div className="grid grid-cols-1 gap-2">
              {testPatterns.map(test => (
                <Button
                  key={test.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestVibration(test.pattern)}
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    {test.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {test.description}
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Appuyez sur les boutons pour tester les différents types de vibrations
            </p>
          </div>
        )}

        {/* Accessibility Note */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Accessibilité :</strong>
            {' '}
            Les vibrations respectent les paramètres système de votre appareil.
            Vous pouvez désactiver toutes les vibrations dans les paramètres de votre téléphone.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
