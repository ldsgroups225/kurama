import type { MotionValue } from 'motion/react'
import { Star, Volume2 } from 'lucide-react'
import { motion } from 'motion/react'
import { MarkdownRenderer } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FlashcardFaceProps {
  content: string
  label: string
  isBack?: boolean
  backgroundColor: MotionValue<string>
  borderColor: MotionValue<string>
  onFlip: () => void
}

export function FlashcardFace({
  content,
  label,
  isBack = false,
  backgroundColor,
  borderColor,
  onFlip,
}: FlashcardFaceProps) {
  const labelColor = isBack ? 'text-success' : 'text-muted-foreground'
  const textSize = isBack ? 'text-xl' : 'text-2xl'

  return (
    <motion.div
      className={`
        absolute inset-0 h-full cursor-grab overflow-hidden rounded-lg shadow-xl
        active:cursor-grabbing
      `}
      onClick={onFlip}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isBack ? 'rotateY(180deg)' : undefined,
        backgroundColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor,
      }}
    >
      <Card className="h-full border-0 bg-transparent shadow-none">
        <div className={`
          pointer-events-none absolute top-4 right-4 left-4 z-10 flex
          items-center justify-between
        `}
        >
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-background/80 backdrop-blur-sm"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-background/80 backdrop-blur-sm"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className={`
          flex h-full flex-col items-center justify-center p-8
        `}
        >
          <div className="w-full space-y-6 text-center">
            <div className={`
              text-xs font-semibold
              ${labelColor}
              tracking-wider uppercase
            `}
            >
              {label}
            </div>
            <div className={`
              ${textSize}
              px-4 leading-relaxed font-medium
            `}
            >
              <MarkdownRenderer
                content={content}
                compact
                centered
                className="[&_p]:text-foreground [&_p]:my-0"
              />
            </div>
          </div>

          {!isBack && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute right-0 bottom-8 left-0 text-center"
            >
              <p className="text-xs text-muted-foreground">Appuyez pour retourner</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
