import { AlertCircle, CheckCircle2, FileJson, Upload } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CardImportData {
  cardType: 'basic' | 'multichoice' | 'true_false' | 'fill_blank'
  frontContent?: string
  backContent?: string
  question?: string
  options?: string[]
  correctAnswer?: string | number | boolean
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  points?: number
}

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (cards: CardImportData[]) => Promise<void>
  lessonId: number
  isLoading?: boolean
}

const exampleJson = `[
  {
    "cardType": "basic",
    "frontContent": "Qu'est-ce que la photosynthèse ?",
    "backContent": "Processus par lequel les plantes convertissent la lumière en énergie.",
    "difficulty": "easy"
  },
  {
    "cardType": "multichoice",
    "question": "Quelle est la capitale de la Côte d'Ivoire ?",
    "options": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"],
    "correctAnswer": 1,
    "explanation": "Yamoussoukro est la capitale politique depuis 1983.",
    "difficulty": "medium"
  }
]`

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  isLoading,
}: BulkImportDialogProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [parsedCards, setParsedCards] = useState<CardImportData[] | null>(null)

  const validateAndParse = () => {
    setError(null)
    setParsedCards(null)

    if (!jsonInput.trim()) {
      setError('Veuillez entrer du JSON')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)

      if (!Array.isArray(parsed)) {
        setError('Le JSON doit être un tableau de cartes')
        return
      }

      if (parsed.length === 0) {
        setError('Le tableau ne peut pas être vide')
        return
      }

      // Validate each card
      const validatedCards: CardImportData[] = []
      for (let i = 0; i < parsed.length; i++) {
        const card = parsed[i]

        if (!card.cardType) {
          setError(`Carte ${i + 1}: cardType est requis`)
          return
        }

        if (!['basic', 'multichoice', 'true_false', 'fill_blank'].includes(card.cardType)) {
          setError(`Carte ${i + 1}: cardType invalide (basic, multichoice, true_false, fill_blank)`)
          return
        }

        if (card.cardType === 'basic') {
          if (!card.frontContent || !card.backContent) {
            setError(`Carte ${i + 1}: frontContent et backContent sont requis pour les cartes basic`)
            return
          }
        }

        if (card.cardType === 'multichoice') {
          if (!card.question || !card.options || card.correctAnswer === undefined) {
            setError(`Carte ${i + 1}: question, options et correctAnswer sont requis pour multichoice`)
            return
          }
          if (!Array.isArray(card.options) || card.options.length < 2) {
            setError(`Carte ${i + 1}: options doit être un tableau avec au moins 2 éléments`)
            return
          }
        }

        validatedCards.push({
          cardType: card.cardType,
          frontContent: card.frontContent,
          backContent: card.backContent,
          question: card.question,
          options: card.options,
          correctAnswer: card.correctAnswer,
          explanation: card.explanation,
          difficulty: card.difficulty,
          points: card.points,
        })
      }

      setParsedCards(validatedCards)
    }
    catch {
      setError('JSON invalide. Vérifiez la syntaxe.')
    }
  }

  const handleImport = async () => {
    if (!parsedCards)
      return

    try {
      await onImport(parsedCards)
      setJsonInput('')
      setParsedCards(null)
      onOpenChange(false)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    }
  }

  const loadExample = () => {
    setJsonInput(exampleJson)
    setError(null)
    setParsedCards(null)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border/50 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import en masse de cartes
          </DialogTitle>
          <DialogDescription>
            Importez plusieurs cartes à la fois en utilisant le format JSON.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="flex items-center justify-between">
            <Label htmlFor="json-input">Données JSON</Label>
            <Button variant="outline" size="sm" onClick={loadExample}>
              <FileJson className="mr-2 h-4 w-4" />
              Charger exemple
            </Button>
          </motion.div>

          <motion.div variants={item}>
            <Textarea
              id="json-input"
              placeholder="Collez votre JSON ici..."
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                setError(null)
                setParsedCards(null)
              }}
              className="font-mono text-sm min-h-[200px]"
            />
          </motion.div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedCards && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center gap-2">
                <span>
                  {parsedCards.length}
                  {' '}
                  carte(s) validée(s)
                </span>
                <div className="flex gap-1">
                  {Object.entries(
                    parsedCards.reduce((acc, card) => {
                      acc[card.cardType] = (acc[card.cardType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>),
                  ).map(([type, count]) => (
                    <Badge key={type} variant="secondary">
                      {type}
                      :
                      {count}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <motion.div variants={item} className="text-xs text-muted-foreground space-y-1">
            <p><strong>Types de cartes supportés:</strong></p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                <code>basic</code>
                : frontContent, backContent
              </li>
              <li>
                <code>multichoice</code>
                : question, options[], correctAnswer (index)
              </li>
              <li>
                <code>true_false</code>
                : question, correctAnswer (true/false)
              </li>
              <li>
                <code>fill_blank</code>
                : question, correctAnswer (texte)
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {!parsedCards
            ? (
                <Button onClick={validateAndParse} disabled={!jsonInput.trim()}>
                  Valider JSON
                </Button>
              )
            : (
                <Button onClick={handleImport} disabled={isLoading}>
                  {isLoading ? 'Import...' : `Importer ${parsedCards.length} carte(s)`}
                </Button>
              )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
