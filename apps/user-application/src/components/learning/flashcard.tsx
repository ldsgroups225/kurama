import type { MotionValue, PanInfo } from 'motion/react'
import { AnimatePresence, motion } from 'motion/react'
import { FlashcardFace } from './flashcard-face'

interface Card {
  frontContent: string
  backContent: string
}

interface FlashcardProps {
  card: Card
  cardIndex: number
  isFlipped: boolean
  cardOrientation: 'term' | 'definition'
  cardHeight: number
  x: MotionValue<number>
  rotate: MotionValue<number>
  opacity: MotionValue<number>
  backgroundColor: MotionValue<string>
  borderColor: MotionValue<string>
  onFlip: () => void
  onDragStart: () => void
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void
}

export function Flashcard({
  card,
  cardIndex,
  isFlipped,
  cardOrientation,
  cardHeight,
  x,
  rotate,
  opacity,
  backgroundColor,
  borderColor,
  onFlip,
  onDragStart,
  onDragEnd,
}: FlashcardProps) {
  const frontContent = cardOrientation === 'term' ? card.frontContent : card.backContent
  const backContent = cardOrientation === 'term' ? card.backContent : card.frontContent
  const frontLabel = cardOrientation === 'term' ? 'Terme' : 'Définition'
  const backLabel = cardOrientation === 'term' ? 'Définition' : 'Terme'

  return (
    <div
      className="relative mx-4 flex items-center justify-center"
      style={{ height: `${cardHeight}px` }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cardIndex}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: -250, right: 250 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          className="absolute inset-0 touch-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <FlashcardFace
              content={frontContent}
              label={frontLabel}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              onFlip={onFlip}
            />

            <FlashcardFace
              content={backContent}
              label={backLabel}
              isBack
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              onFlip={onFlip}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
