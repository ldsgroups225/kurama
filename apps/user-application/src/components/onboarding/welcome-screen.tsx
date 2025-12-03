'use client'

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Smartphone,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSignIn: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
}

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
}

const floatVariants = {
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className={`
      flex min-h-screen flex-col bg-linear-to-br from-orange-50 via-purple-50
      to-blue-50
    `}
    >
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Icon */}
          <motion.div
            className="relative flex justify-center"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div
                className={`
                  flex h-40 w-40 items-center justify-center rounded-full
                  bg-linear-to-br from-orange-500 to-purple-600 shadow-2xl
                `}
                variants={iconVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <GraduationCap
                  className="h-20 w-20 text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
              {/* Decorative icons */}
              <motion.div
                className={`
                  absolute -top-2 -right-2 flex h-10 w-10 items-center
                  justify-center rounded-full bg-yellow-400 shadow-lg
                `}
                variants={floatVariants}
                animate="animate"
              >
                <Star className="h-5 w-5 text-white" fill="currentColor" />
              </motion.div>
              <motion.div
                className={`
                  absolute -bottom-2 -left-2 flex h-10 w-10 items-center
                  justify-center rounded-full bg-blue-400 shadow-lg
                `}
                variants={pulseVariants}
                animate="animate"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="space-y-3 text-center"
            variants={itemVariants}
          >
            <h1 className="text-3xl leading-tight font-bold text-gray-900">
              Bienvenue sur
              {' '}
              <span className={`
                bg-linear-to-r from-orange-500 to-purple-600 bg-clip-text
                text-transparent
              `}
              >
                Kurama
              </span>
            </h1>
            <p className="px-2 text-base leading-relaxed text-gray-600">
              Votre compagnon d'apprentissage intelligent pour réussir le BEPC
              et le BAC en Côte d'Ivoire
            </p>
          </motion.div>

          {/* Features */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.div
              className={`
                flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm
              `}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.div
                className={`
                  flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                  bg-orange-100
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="h-6 w-6 text-orange-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Apprentissage personnalisé
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Adapté à votre rythme et niveau
                </p>
              </div>
            </motion.div>

            <motion.div
              className={`
                flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm
              `}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.div
                className={`
                  flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                  bg-purple-100
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Smartphone className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Disponible hors ligne
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Étudiez n'importe où, n'importe quand
                </p>
              </div>
            </motion.div>

            <motion.div
              className={`
                flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm
              `}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.div
                className={`
                  flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                  bg-blue-100
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Suivi de progression
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Badges, défis et récompenses
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="space-y-4 px-6 pb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onGetStarted}
            size="lg"
            className={`
              group w-full rounded-full bg-linear-to-r from-orange-500
              to-purple-600 py-6 font-semibold text-white shadow-xl
              transition-all duration-300
              hover:from-orange-600 hover:to-purple-700 hover:shadow-2xl
            `}
          >
            Commencer l'aventure
            <motion.div
              className="ml-2 inline-block"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>

        <motion.p
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Déjà un compte?
          {' '}
          <motion.button
            onClick={onSignIn}
            className={`
              font-semibold text-purple-600
              hover:text-purple-700
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Se connecter
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default WelcomeScreen
