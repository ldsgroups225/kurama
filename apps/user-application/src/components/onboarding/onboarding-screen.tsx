'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Sparkles,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateUUID } from '@/utils/generateUUID'

/**
 * Ambient background colors for onboarding steps
 * These match the theme variables in styles.css:
 * - indigo: --xp-to (oklch 0.5 0.24 264) ≈ #4f46e5 with 20% opacity
 * - purple: --epic-from (oklch 0.6 0.26 295) ≈ #9333ea with 20% opacity
 * - pink: --chart-5 (oklch 0.645 0.246 16.439) ≈ #db2777 with 20% opacity
 */
const AMBIENT_COLORS = {
  indigo: 'rgba(79, 70, 229, 0.2)', // #4f46e533
  purple: 'rgba(147, 51, 234, 0.2)', // #9333ea33
  pink: 'rgba(219, 39, 119, 0.2)', // #db277733
} as const

interface OnboardingScreenProps {
  onComplete: () => void
  onSkip: () => void
}

const onboardingSteps = [
  {
    icon: BookOpen,
    title: 'Leçons interactives',
    description:
      'Découvrez des cours alignés sur le programme du Ministère de l\'Éducation.',
    gradient: 'bg-linear-to-br from-indigo-500 to-purple-600',
    shadow: 'shadow-indigo-500/20',
    blobColor: 'indigo' as const,
  },
  {
    icon: Brain,
    title: 'Révision intelligente',
    description:
      'Notre système de répétition espacée vous aide à mémoriser efficacement.',
    gradient: 'bg-linear-to-br from-purple-500 to-pink-600',
    shadow: 'shadow-purple-500/20',
    blobColor: 'purple' as const,
  },
  {
    icon: Users,
    title: 'Apprendre ensemble',
    description:
      'Rejoignez des groupes d\'étude et participez à des défis.',
    gradient: 'bg-linear-to-br from-pink-500 to-rose-600',
    shadow: 'shadow-pink-500/20',
    blobColor: 'pink' as const,
  },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
}

const sparkleVariants = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// Swipe hint animation
const swipeHintVariants = {
  initial: { opacity: 0, x: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    x: [0, -20, -20, -40],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
      ease: 'easeInOut' as const,
    },
  },
}

export function OnboardingScreen({
  onComplete,
  onSkip,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0
  const step = onboardingSteps[currentStep]!
  const Icon = step.icon

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    }
    else {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleDotClick = (index: number) => {
    setDirection(index > currentStep ? 1 : -1)
    setCurrentStep(index)
  }

  // Swipe threshold in pixels
  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }, velocity: { x: number } },
  ) => {
    const swipe = swipePower(info.offset.x, info.velocity.x)

    if (swipe < -swipeConfidenceThreshold && !isLastStep) {
      // Swiped left - go to next
      handleNext()
    }
    else if (swipe > swipeConfidenceThreshold && !isFirstStep) {
      // Swiped right - go to previous
      handlePrevious()
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
      {/* Ambient Background - Dynamic based on step */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] transition-colors duration-700"
          animate={{ backgroundColor: AMBIENT_COLORS[step.blobColor] }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-16">
          <AnimatePresence mode="wait">
            {currentStep > 0 && (
              <motion.button
                onClick={handlePrevious}
                className="text-muted-foreground transition-colors hover:text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={onSkip}
          className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Passer
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false)
              handleDragEnd(event, info)
            }}
            whileDrag={{ scale: 0.95 }}
            className="w-full max-w-sm cursor-grab touch-pan-y space-y-12 active:cursor-grabbing"
          >
            {/* Icon with decorative element */}
            <div className="relative flex justify-center">
              <div className="relative">
                <motion.div
                  className={`
                    h-40 w-40
                    ${step.gradient}
                    flex items-center justify-center rounded-[2.5rem] shadow-2xl ${step.shadow}
                  `}
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-20 w-20 text-white drop-shadow-lg" strokeWidth={1.5} />
                </motion.div>
                {/* Decorative sparkle */}
                <motion.div
                  className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-lg"
                  variants={sparkleVariants}
                  animate="animate"
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" fill="currentColor" />
                </motion.div>
              </div>
            </div>

            {/* Text content */}
            <motion.div
              className="space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                {step.title}
              </h2>
              <p className="px-2 text-lg leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>

            {/* Progress indicators */}
            <motion.div
              className="flex justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {onboardingSteps.map((s, index) => (
                <motion.button
                  key={generateUUID()}
                  onClick={() => handleDotClick(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${index === currentStep
                      ? `w-8 ${s.gradient}`
                      : 'w-2 bg-white/10 hover:bg-white/20'
                    }
                  `}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </motion.div>

            {/* Swipe hint - only show on first step and not while dragging */}
            {currentStep === 0 && !isDragging && (
              <motion.div
                className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium"
                variants={swipeHintVariants}
                initial="initial"
                animate="animate"
              >
                <span>Glissez pour continuer</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="px-6 pb-10 pt-4 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleNext}
            size="lg"
            className={`
              w-full
              ${step.gradient}
              group rounded-2xl py-7 font-bold text-lg text-white shadow-xl ${step.shadow}
              transition-all duration-300
              hover:opacity-90 border-t border-white/20
            `}
          >
            {isLastStep ? 'C\'est parti !' : 'Suivant'}
            <motion.div
              className="ml-2 inline-block"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default OnboardingScreen
