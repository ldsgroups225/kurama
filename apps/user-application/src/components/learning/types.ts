import type { MotionValue } from 'motion/react'

export interface CardOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface OrderingItem {
  id: string
  text: string
}

export interface LearningCard {
  id: number
  cardType: 'basic' | 'multichoice' | 'true_false' | 'fill_blank' | 'matching' | 'ordering'
  frontContent: string
  backContent: string
  question?: string
  options?: CardOption[]
  correctAnswer?: string
  explanation?: string
  hints?: string[]
  timeLimit?: number
  points?: number
  pairs?: MatchingPair[]
  items?: OrderingItem[]
}

export interface LearningCardProps {
  card: LearningCard
  cardIndex: number
  totalCards: number
  onAnswer: (isCorrect: boolean) => void
  // Animation props (optional, mainly for Flashcard)
  x?: MotionValue<number>
  rotate?: MotionValue<number>
  opacity?: MotionValue<number>
  isFlipped?: boolean
  onFlip?: () => void
}

export type FlashcardViewProps = LearningCardProps
export type MultipleChoiceViewProps = LearningCardProps
export type TrueFalseViewProps = LearningCardProps
export type FillBlankViewProps = LearningCardProps
export type MatchingCardProps = LearningCardProps
export type OrderingCardProps = LearningCardProps
