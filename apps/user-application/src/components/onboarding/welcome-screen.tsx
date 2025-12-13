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
import { generateUUID } from '@/utils/generateUUID'

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
    <div className="flex min-h-screen flex-col bg-background overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative z-10">
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
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
              <motion.div
                className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/30 border border-white/10"
                variants={iconVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <GraduationCap
                  className="h-20 w-20 text-white drop-shadow-md"
                  strokeWidth={1.5}
                />
              </motion.div>
              {/* Decorative icons */}
              <motion.div
                className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-white/10 shadow-xl"
                variants={floatVariants}
                animate="animate"
              >
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400/20" />
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-white/10 shadow-xl"
                variants={pulseVariants}
                animate="animate"
              >
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-blue-500/10">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="space-y-4 text-center"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
              Bienvenue sur
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                Kurama
              </span>
            </h1>
            <p className="px-2 text-base font-medium text-muted-foreground leading-relaxed">
              Votre compagnon d'apprentissage intelligent pour réussir le BEPC
              et le BAC en Côte d'Ivoire
            </p>
          </motion.div>

          {/* Features */}
          <motion.div className="space-y-3" variants={itemVariants}>
            {[
              {
                icon: Target,
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
                title: 'Apprentissage personnalisé',
                desc: 'Adapté à votre rythme et niveau',
              },
              {
                icon: Smartphone,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                title: 'Disponible hors ligne',
                desc: 'Étudiez n\'importe où, n\'importe quand',
              },
              {
                icon: Trophy,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                title: 'Suivi de progression',
                desc: 'Badges, défis et récompenses',
              },
            ].map(feature => (
              <motion.div
                key={generateUUID()}
                className="group flex items-center gap-4 rounded-2xl bg-card border border-border p-4 backdrop-blur-md transition-all hover:bg-accent hover:border-accent-foreground/10"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="space-y-6 px-6 pb-10 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="group w-full rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 py-7 text-lg font-bold text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 border-t border-white/10"
          >
            Commencer l'aventure
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        <motion.p
          className="text-center text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Déjà un compte?
          {' '}
          <button
            type="button"
            onClick={onSignIn}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
          >
            Se connecter
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default WelcomeScreen
