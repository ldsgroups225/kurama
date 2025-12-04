import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RotateCcw, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import type { CardOption } from '@/lib/schemas'

interface CardPreviewProps {
  cardType: 'basic' | 'multichoice' | 'true_false' | 'fill_blank'
  frontContent: string
  backContent: string
  question?: string
  options?: CardOption[]
  correctAnswer?: string
  explanation?: string
  points?: number
  difficulty?: number
}

const cardTypeLabels: Record<string, string> = {
  basic: 'Basique',
  multichoice: 'Choix multiple',
  true_false: 'Vrai/Faux',
  fill_blank: 'Texte à trous',
}

const difficultyLabels = ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Très difficile', 'Expert']

export function CardPreview({
  cardType,
  frontContent,
  backContent,
  question: _question,
  options,
  correctAnswer,
  explanation,
  points = 10,
  difficulty = 0,
}: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)

  const handleReset = () => {
    setIsFlipped(false)
    setSelectedAnswer('')
    setUserInput('')
    setShowResult(false)
  }

  const handleCheckAnswer = () => {
    setShowResult(true)
  }

  const isCorrect = () => {
    if (cardType === 'multichoice') {
      const correctOption = options?.find((opt) => opt.isCorrect)
      return selectedAnswer === correctOption?.id
    }
    if (cardType === 'true_false') {
      return selectedAnswer === correctAnswer
    }
    if (cardType === 'fill_blank') {
      return userInput.toLowerCase().trim() === correctAnswer?.toLowerCase().trim()
    }
    return false
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Aperçu</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{cardTypeLabels[cardType]}</Badge>
            <Badge variant="secondary">{points} pts</Badge>
            {difficulty > 0 && (
              <Badge variant="outline" className="text-xs">
                {difficultyLabels[difficulty] || `Niveau ${difficulty}`}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cardType === 'basic' ? (
          // Basic flashcard with flip
          <div className="space-y-4">
            <div className="min-h-[120px] p-4 rounded-lg border bg-muted/50 flex items-center justify-center text-center">
              <p className="text-lg">
                {isFlipped ? backContent || 'Contenu verso...' : frontContent || 'Contenu recto...'}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
                {isFlipped ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {isFlipped ? 'Voir recto' : 'Voir verso'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        ) : cardType === 'multichoice' ? (
          // Multiple choice
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="font-medium">{frontContent || 'Question...'}</p>
            </div>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {options && options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg border ${showResult
                      ? option.isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : selectedAnswer === option.id
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : ''
                      : ''
                      }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} disabled={showResult} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text || 'Option...'}
                    </Label>
                    {showResult && option.isCorrect && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {showResult && selectedAnswer === option.id && !option.isCorrect && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Aucune option définie</p>
              )}
            </RadioGroup>
            <div className="flex justify-center gap-2">
              {!showResult ? (
                <Button
                  size="sm"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                >
                  Vérifier
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        ) : cardType === 'true_false' ? (
          // True/False
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="font-medium">{frontContent || 'Affirmation...'}</p>
            </div>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {['true', 'false'].map((value) => (
                <div
                  key={value}
                  className={`flex items-center space-x-2 p-2 rounded-lg border ${showResult
                    ? value === correctAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : selectedAnswer === value
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : ''
                    : ''
                    }`}
                >
                  <RadioGroupItem value={value} id={value} disabled={showResult} />
                  <Label htmlFor={value} className="flex-1 cursor-pointer">
                    {value === 'true' ? 'Vrai' : 'Faux'}
                  </Label>
                  {showResult && value === correctAnswer && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {showResult && selectedAnswer === value && value !== correctAnswer && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-center gap-2">
              {!showResult ? (
                <Button
                  size="sm"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                >
                  Vérifier
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Fill in the blank
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="font-medium">
                {frontContent?.replace('___', '_____') || 'Texte avec ___ à compléter...'}
              </p>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Votre réponse..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={showResult}
                className={
                  showResult
                    ? isCorrect()
                      ? 'border-green-500'
                      : 'border-red-500'
                    : ''
                }
              />
              {showResult && !isCorrect() && (
                <p className="text-sm text-muted-foreground">
                  Réponse correcte : <span className="font-medium">{correctAnswer}</span>
                </p>
              )}
            </div>
            <div className="flex justify-center gap-2">
              {!showResult ? (
                <Button
                  size="sm"
                  onClick={handleCheckAnswer}
                  disabled={!userInput.trim()}
                >
                  Vérifier
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        {showResult && explanation && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm">
              <span className="font-medium">Explication :</span> {explanation}
            </p>
          </div>
        )}

        {/* Result indicator */}
        {showResult && cardType !== 'basic' && (
          <div className={`text-center p-2 rounded-lg ${isCorrect() ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
            {isCorrect() ? '✓ Correct !' : '✗ Incorrect'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
