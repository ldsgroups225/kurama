import type { MotionValue } from 'motion/react'
import { motion } from 'motion/react'

interface SessionCounterBadgeProps {
  count: number
  type: 'correct' | 'incorrect'
  backgroundColor: MotionValue<string>
  scale: MotionValue<number>
  showPreview: MotionValue<number>
  hideCount: MotionValue<number>
}

export function SessionCounterBadge({
  count,
  type,
  backgroundColor,
  scale,
  showPreview,
  hideCount,
}: SessionCounterBadgeProps) {
  const isCorrect = type === 'correct'
  const borderColor = isCorrect ? 'border-success/20' : 'border-warning/20'
  const textColor = isCorrect ? 'text-success' : 'text-warning'
  const roundedClass = isCorrect ? 'rounded-l-full' : 'rounded-r-full'

  return (
    <motion.div
      className={`
        py-2 text-base font-semibold
        ${roundedClass}
        w-20 border-2
        ${borderColor}
        relative flex items-center justify-center overflow-hidden
      `}
      style={{
        backgroundColor,
        scale,
      }}
    >
      <motion.span
        className={`
          ${textColor}
          relative z-10
        `}
        style={{ opacity: hideCount }}
      >
        {count}
      </motion.span>
      <motion.span
        className={`
          absolute inset-0 z-10 flex items-center justify-center font-bold
          text-white
        `}
        style={{ opacity: showPreview }}
      >
        +1
      </motion.span>
    </motion.div>
  )
}
