"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Brain,
  Users,
  Sparkles,
} from "lucide-react";

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    icon: BookOpen,
    title: "Leçons interactives",
    description:
      "Découvrez des cours alignés sur le programme du Ministère de l'Éducation avec des explications claires et des exemples pratiques.",
    color: "bg-gradient-xp",
    bgColor: "bg-xp",
  },
  {
    icon: Brain,
    title: "Révision intelligente",
    description:
      "Notre système de répétition espacée vous aide à mémoriser efficacement. Révisez au bon moment pour maximiser votre apprentissage.",
    color: "bg-gradient-epic",
    bgColor: "bg-epic",
  },
  {
    icon: Users,
    title: "Apprendre ensemble",
    description:
      "Rejoignez des groupes d'étude, participez à des défis et comparez vos progrès avec d'autres étudiants.",
    color: "bg-gradient-streak",
    bgColor: "bg-streak",
  },
];

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
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const sparkleVariants = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

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
      ease: "easeInOut" as const,
    },
  },
};

export function OnboardingScreen({
  onComplete,
  onSkip,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const step = onboardingSteps[currentStep]!;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  // Swipe threshold in pixels
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);

    if (swipe < -swipeConfidenceThreshold && !isLastStep) {
      // Swiped left - go to next
      handleNext();
    } else if (swipe > swipeConfidenceThreshold && !isFirstStep) {
      // Swiped right - go to previous
      handlePrevious();
    }
  };

  return (
    <motion.div
      className={`min-h-screen ${step.bgColor} flex flex-col`}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 pt-6 pb-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-16">
          <AnimatePresence mode="wait">
            {currentStep > 0 && (
              <motion.button
                onClick={handlePrevious}
                className="text-muted-foreground hover:text-foreground transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Passer
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              handleDragEnd(event, info);
            }}
            whileDrag={{ scale: 0.95 }}
            className="max-w-sm w-full space-y-8 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* Icon with decorative element */}
            <div className="flex justify-center relative">
              <div className="relative">
                <motion.div
                  className={`w-36 h-36 ${step.color} rounded-3xl flex items-center justify-center shadow-2xl`}
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />
                </motion.div>
                {/* Decorative sparkle */}
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-warning rounded-full flex items-center justify-center shadow-lg"
                  variants={sparkleVariants}
                  animate="animate"
                >
                  <Sparkles className="w-4 h-4 text-white" fill="currentColor" />
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
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {step.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed px-2">
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
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                    ? `w-8 ${step.color}`
                    : "w-2 bg-muted"
                    }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </motion.div>

            {/* Swipe hint - only show on first step and not while dragging */}
            {currentStep === 0 && !isDragging && (
              <motion.div
                className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-6"
                variants={swipeHintVariants}
                initial="initial"
                animate="animate"
              >
                <span>Glissez pour continuer</span>
                <ArrowRight className="w-4 h-4" />
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
            className={`w-full ${step.color} hover:opacity-90 text-white font-semibold py-6 rounded-full shadow-xl transition-all duration-300 group`}
          >
            {isLastStep ? "Commencer" : "Suivant"}
            <motion.div
              className="inline-block ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingScreen;
