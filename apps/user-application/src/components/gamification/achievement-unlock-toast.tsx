import type { AchievementWithProgress } from '@kurama/data-ops/queries/achievements'
import { Award, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AchievementUnlockToastProps {
  achievements: AchievementWithProgress[]
  onDismiss: (achievementIds: string[]) => void
}

// Icon mapping for achievements
const iconMap: Record<string, typeof Award> = {
  Award,
  BookMarked: Award, // Fallback to Award for now
  BookOpen: Award,
  Calendar: Award,
  CalendarCheck: Award,
  Crown: Award,
  Eye: Award,
  Flame: Award,
  GraduationCap: Award,
  Library: Award,
  Medal: Award,
  Sparkles: Award,
  Star: Award,
  Target: Award,
  TrendingUp: Award,
  Trophy: Award,
  Zap: Award,
}

const rarityGradients = {
  common: 'bg-gradient-common',
  rare: 'bg-gradient-rare',
  epic: 'bg-gradient-epic',
  legendary: 'bg-gradient-legendary',
} as const

const rarityColors = {
  common: 'from-zinc-400 to-zinc-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600',
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

  const currentAchievement = achievements[currentIndex]

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss(achievements.map(a => a.id))
    }, 300)
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

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Toast */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl max-w-sm mx-4">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="text-center space-y-4">
                {/* Celebration particles */}
                <div className="relative">
                  {[...Array.from({ length: 8 })].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 40, 0],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 40, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.2 + i * 0.1,
                        ease: 'easeOut',
                      }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-400 rounded-full"
                      style={{
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}

                  {/* Achievement icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 200,
                      delay: 0.3,
                    }}
                    className={cn(
                      'w-20 h-20 rounded-full flex items-center justify-center mx-auto',
                      `bg-linear-to-br ${rarityColors[currentAchievement.rarity]}`,
                      'shadow-lg',
                    )}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Achievement unlocked text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Badge Débloqué !
                  </h3>
                  <div className={cn(
                    'inline-block px-2 py-1 rounded text-xs font-bold text-white mb-2',
                    rarityGradients[currentAchievement.rarity],
                  )}
                  >
                    {currentAchievement.rarity.toUpperCase()}
                  </div>
                </motion.div>

                {/* Achievement details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <h4 className="text-xl font-bold text-foreground">
                    {currentAchievement.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentAchievement.description}
                  </p>
                </motion.div>

                {/* Progress indicator */}
                {achievements.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex justify-center gap-1"
                  >
                    {achievements.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full transition-colors',
                          i === currentIndex ? 'bg-foreground' : 'bg-muted',
                        )}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Action button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={handleNext}
                  className={cn(
                    'w-full py-3 px-6 rounded-xl font-semibold text-white transition-all',
                    `bg-linear-to-r ${rarityColors[currentAchievement.rarity]}`,
                    'hover:shadow-lg hover:scale-105 active:scale-95',
                  )}
                >
                  {currentIndex < achievements.length - 1 ? 'Suivant' : 'Continuer'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
