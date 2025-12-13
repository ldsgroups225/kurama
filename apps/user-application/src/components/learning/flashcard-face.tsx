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
  const labelColor = isBack ? 'text-emerald-500 font-bold' : 'text-muted-foreground font-semibold'
  const textSize = isBack ? 'text-xl' : 'text-2xl'

  return (
    <motion.div
      className={`
        absolute inset-0 h-full cursor-grab overflow-hidden rounded-3xl shadow-xl backdrop-blur-xl
        active:cursor-grabbing bg-card
      `}
      onClick={onFlip}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isBack ? 'rotateY(180deg)' : undefined,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor,
      }}
    >
      {/* Swipe Color Overlay */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ backgroundColor }}
      />
      <Card className="relative z-10 h-full border-0 bg-transparent shadow-none">
        <div className={`
          pointer-events-none absolute top-4 right-4 left-4 z-10 flex
          items-center justify-between
        `}
        >
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-card/50 hover:bg-accent text-muted-foreground hover:text-foreground backdrop-blur-sm rounded-full border border-border"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-card/50 hover:bg-accent text-muted-foreground hover:text-foreground backdrop-blur-sm rounded-full border border-border"
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
              text-xs font-bold
              ${labelColor}
              tracking-widest uppercase
            `}
            >
              {label}
            </div>
            <div className={`
              ${textSize}
              px-4 leading-relaxed font-medium text-foreground
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
              <p className="text-xs text-muted-foreground font-medium">Appuyez pour retourner</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
