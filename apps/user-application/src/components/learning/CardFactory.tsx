import type { LearningCardProps } from './types'
import { FillBlankView } from './FillBlankView'
import { FlashcardView } from './FlashcardView'
import { MatchingView } from './MatchingView'
import { MultipleChoiceView } from './MultipleChoiceView'
import { OrderingView } from './OrderingView'
import { TrueFalseView } from './TrueFalseView'

// Extended props to include Flashcard specific props
interface CardFactoryProps extends LearningCardProps {
  // Flashcard specific props
  cardOrientation?: 'term' | 'definition'
  cardHeight?: number
  backgroundColor?: any
  borderColor?: any
  onDragStart?: () => void
  onDragEnd?: (event: any, info: any) => void
  x?: any
  rotate?: any
  opacity?: any
}

export function CardFactory(props: CardFactoryProps) {
  const { card } = props

  switch (card.cardType) {
    case 'multichoice':
      return <MultipleChoiceView {...props} />
    case 'true_false':
      return <TrueFalseView {...props} />
    case 'fill_blank':
      return <FillBlankView {...props} />
    case 'matching':
      return <MatchingView {...props} />
    case 'ordering':
      return <OrderingView {...props} />
    case 'basic':
    default:
      // Ensure required props for FlashcardView are present or provide defaults
      if (!props.cardHeight) {
        // Fallback or error if used in a context where Flashcard props aren't provided
        // For now, we assume the parent provides them if it's a flashcard session
        return <FlashcardView {...props} cardOrientation={props.cardOrientation || 'term'} cardHeight={props.cardHeight || 400} backgroundColor={props.backgroundColor} borderColor={props.borderColor} onDragStart={props.onDragStart!} onDragEnd={props.onDragEnd!} />
      }
      return <FlashcardView {...props as any} />
  }
}
