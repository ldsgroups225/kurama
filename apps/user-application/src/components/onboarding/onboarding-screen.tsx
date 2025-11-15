'use client'

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Sparkles,
  Users,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateUUID } from '@/utils/generateUUID'

interface OnboardingScreenProps {
  onComplete: () => void
  onSkip: () => void
}

const onboardingSteps = [
  {
    icon: BookOpen,
    title: 'Leçons interactives',
    description:
      'Découvrez des cours alignés sur le programme du Ministère de l\'Éducation avec des explications claires et des exemples pratiques.',
    color: 'bg-gradient-xp',
    bgColor: 'bg-xp',
  },
  {
    icon: Brain,
    title: 'Révision intelligente',
    description:
      'Notre système de répétition espacée vous aide à mémoriser efficacement. Révisez au bon moment pour maximiser votre apprentissage.',
    color: 'bg-gradient-epic',
    bgColor: 'bg-epic',
  },
  {
    icon: Users,
    title: 'Apprendre ensemble',
    description:
      'Rejoignez des groupes d\'étude, participez à des défis et comparez vos progrès avec d\'autres étudiants.',
    color: 'bg-gradient-streak',
    bgColor: 'bg-streak',
  },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
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
    <motion.div
      className={`
        min-h-screen
        ${step.bgColor}
        flex flex-col
      `}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-6 pt-6 pb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-16">
          <AnimatePresence mode="wait">
            {currentStep > 0 && (
              <motion.button
                onClick={handlePrevious}
                className={`
                  text-muted-foreground transition-colors
                  hover:text-foreground
                `}
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
          className={`
            text-sm font-semibold text-muted-foreground transition-colors
            hover:text-foreground
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Passer
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className={`
        flex flex-1 items-center justify-center overflow-hidden px-6
      `}
      >
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
            className={`
              w-full max-w-sm cursor-grab touch-pan-y space-y-8
              active:cursor-grabbing
            `}
          >
            {/* Icon with decorative element */}
            <div className="relative flex justify-center">
              <div className="relative">
                <motion.div
                  className={`
                    h-36 w-36
                    ${step.color}
                    flex items-center justify-center rounded-3xl shadow-2xl
                  `}
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-20 w-20 text-white" strokeWidth={1.5} />
                </motion.div>
                {/* Decorative sparkle */}
                <motion.div
                  className={`
                    bg-gradient-warning absolute -top-2 -right-2 flex h-8 w-8
                    items-center justify-center rounded-full shadow-lg
                  `}
                  variants={sparkleVariants}
                  animate="animate"
                >
                  <Sparkles className="h-4 w-4 text-white" fill="currentColor" />
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
              <h2 className="text-2xl leading-tight font-bold text-foreground">
                {step.title}
              </h2>
              <p className={`
                px-2 text-base leading-relaxed text-muted-foreground
              `}
              >
                {step.description}
              </p>
            </motion.div>

            {/* Progress indicators */}
            <motion.div
              className="flex justify-center gap-2 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {onboardingSteps.map((_, index) => (
                <motion.button
                  key={generateUUID()}
                  onClick={() => handleDotClick(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${index === currentStep
                  ? `
                    w-8
                    ${step.color}
                  `
                  : 'w-2 bg-muted'
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
                className={`
                  mt-6 flex items-center justify-center gap-2 text-sm
                  text-muted-foreground
                `}
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
        className="px-6 pb-8"
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
              ${step.color}
              group rounded-full py-6 font-semibold text-white shadow-xl
              transition-all duration-300
              hover:opacity-90
            `}
          >
            {isLastStep ? 'Commencer' : 'Suivant'}
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
    </motion.div>
  )
}

export default OnboardingScreen
