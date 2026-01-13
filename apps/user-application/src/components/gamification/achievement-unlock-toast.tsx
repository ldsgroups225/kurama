import type { AchievementWithProgress } from '@kurama/data-ops/queries/achievements'
import {
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  Check,
  ChevronRight,
  Crown,
  Eye,
  Flame,
  GraduationCap,
  Library,
  Medal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AchievementUnlockToastProps {
  achievements: AchievementWithProgress[]
  onDismiss: (achievementIds: string[]) => void
}

// Icon mapping for achievements - using actual icons
const iconMap: Record<string, typeof Award> = {
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  Crown,
  Eye,
  Flame,
  GraduationCap,
  Library,
  Medal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
}

// Rarity configuration using semantic color utilities
const rarityConfig = {
  common: {
    gradient: 'bg-gradient-common',
    text: 'text-common',
    bg: 'bg-common',
    border: 'border-common',
    glow: 'shadow-common',
    label: 'Commun',
  },
  rare: {
    gradient: 'bg-gradient-rare',
    text: 'text-rare',
    bg: 'bg-rare',
    border: 'border-rare',
    glow: 'shadow-rare',
    label: 'Rare',
  },
  epic: {
    gradient: 'bg-gradient-epic',
    text: 'text-epic',
    bg: 'bg-epic',
    border: 'border-epic',
    glow: 'shadow-epic',
    label: 'Épique',
  },
  legendary: {
    gradient: 'bg-gradient-legendary',
    text: 'text-legendary',
    bg: 'bg-legendary',
    border: 'border-legendary',
    glow: 'shadow-legendary',
    label: 'Légendaire',
  },
} as const

export function AchievementUnlockToast({ achievements, onDismiss }: AchievementUnlockToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true)
      setCurrentIndex(0)
    }
  }, [achievements])

  // Stop infinite animations when component unmounts
  useEffect(() => {
    return () => {
      setIsVisible(false)
    }
  }, [])

  const currentAchievement = achievements[currentIndex]

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss(achievements.map(a => a.id))
    }, 400)
  }

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    else {
      handleClose()
    }
  }

  if (!currentAchievement)
    return null

  const Icon = iconMap[currentAchievement.icon] ?? Award
  const config = rarityConfig[currentAchievement.rarity]

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Ambient background glow based on rarity */}
            <motion.div
              key={`glow-${currentAchievement.id}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.4, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={cn(
                'absolute pointer-events-none w-[500px] h-[500px] rounded-full blur-[100px]',
                config.gradient,
              )}
            />
          </motion.div>

          {/* Toast Card */}
          <motion.div
            key={currentAchievement.id}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/5">
              {/* Card texture/shine overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fermer"
                className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">

                {/* Rarity Label */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    'mb-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border',
                    config.bg,
                    config.text,
                    config.border,
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  {config.label}
                </motion.div>

                {/* Animated Icon Container */}
                <div className="relative mb-8 group">
                  {/* Rotating outer ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className={cn(
                      'absolute inset-[-10px] rounded-full border-2 border-dashed opacity-30',
                      config.text,
                    )}
                  />

                  {/* Pulsing glow background */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 3, repeat: isVisible ? Infinity : 0 }}
                    className={cn(
                      'absolute inset-0 rounded-full blur-xl',
                      config.gradient,
                    )}
                  />

                  {/* Icon Circle */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                    className={cn(
                      'relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg',
                      config.gradient,
                      config.glow,
                    )}
                  >
                    <Icon className="w-10 h-10 text-white drop-shadow-md" />

                    {/* Inner shine */}
                    <div className="absolute inset-0 rounded-full bg-linear-to-tr from-white/20 to-transparent" />
                  </motion.div>

                  {/* Floating Particles */}
                  {[1, 2, 3, 4, 5, 6].map((key, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.cos(i * 60 * Math.PI / 180) * 80,
                        y: Math.sin(i * 60 * Math.PI / 180) * 80,
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.3 + (i * 0.1),
                        ease: 'easeOut',
                        repeat: isVisible ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                      className={cn(
                        'absolute top-1/2 left-1/2 w-2 h-2 rounded-full',
                        config.text.replace('text-', 'bg-'),
                      )}
                      style={{ marginTop: '-4px', marginLeft: '-4px' }}
                    />
                  ))}
                </div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-2xl font-bold tracking-tight mb-2"
                >
                  {currentAchievement.name}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-sm leading-relaxed mb-8 max-w-[260px]"
                >
                  {currentAchievement.description}
                </motion.p>

                {/* Footer / Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-4"
                >
                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className={cn(
                      'group w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all',
                      'flex items-center justify-center gap-2 relative overflow-hidden',
                      'hover:scale-[1.02] active:scale-[0.98]',
                      config.gradient,
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {currentIndex < achievements.length - 1
                        ? (
                            <>
                              Suivant
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )
                        : (
                            <>
                              Continuer
                              <Check className="w-4 h-4" />
                            </>
                          )}
                    </span>
                    {/* Button hover shine */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  {/* Progress Dots */}
                  {achievements.length > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {achievements.map((achievement, i) => (
                        <div
                          key={achievement.id}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            i === currentIndex
                              ? `w-6 ${config.text.replace('text-', 'bg-')}`
                              : 'w-1.5 bg-white/10',
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
