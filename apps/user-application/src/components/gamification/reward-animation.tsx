import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Trophy, Zap } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export interface Reward {
  type: 'xp' | 'achievement' | 'level_up' | 'streak'
  title: string
  description: string
  value?: number
  icon?: React.ReactNode
}

interface RewardAnimationProps {
  reward: Reward
  onClose: () => void
  show: boolean
}

interface AnimationState {
  isVisible: boolean
  starStyles: (React.CSSProperties & { id: string })[]
}

export function RewardAnimation({ reward, onClose, show }: RewardAnimationProps) {
  const [animation, setAnimation] = useState<AnimationState>(() => ({
    isVisible: false,
    starStyles: [],
  }))

  useEffect(() => {
    if (show) {
      // Use a microtask to defer the state update
      queueMicrotask(() => {
        const styles = Array.from({ length: 20 }).map(() => ({
          id: generateUUID(),
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }))
        setAnimation({ isVisible: true, starStyles: styles })
      })
    }
  }, [show])

  const handleClose = () => {
    setAnimation(prev => ({ ...prev, isVisible: false }))
    setTimeout(onClose, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClose()
    }
  }

  if (!show && !animation.isVisible)
    return null

  const getRewardIcon = () => {
    if (reward.icon)
      return reward.icon

    switch (reward.type) {
      case 'xp':
        return <Zap className="h-12 w-12 text-white" />
      case 'achievement':
        return <Trophy className="h-12 w-12 text-white" />
      case 'level_up':
        return <Star className="h-12 w-12 text-white" />
      case 'streak':
        return <Star className="h-12 w-12 text-white" />
      default:
        return <Trophy className="h-12 w-12 text-white" />
    }
  }

  const getRewardGradient = () => {
    switch (reward.type) {
      case 'xp':
        return 'bg-gradient-xp'
      case 'achievement':
        return 'bg-gradient-level'
      case 'level_up':
        return 'bg-gradient-epic'
      case 'streak':
        return 'bg-gradient-streak'
      default:
        return 'bg-gradient-to-br from-primary to-primary'
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close reward dialog"
      className={cn(
        `
          fixed inset-0 z-50 flex items-center justify-center bg-background/80
          p-4 backdrop-blur-sm transition-opacity duration-300
        `,
        animation.isVisible ? 'opacity-100' : 'opacity-0',
      )}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-title"
        aria-describedby="reward-description"
        className={cn(
          `
            w-full max-w-sm overflow-hidden rounded-lg border bg-card
            text-card-foreground shadow-2xl transition-all duration-300
          `,
          animation.isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
        onClickCapture={e => e.stopPropagation()}
      >
        <div className="p-0">
          {/* Animated Background */}
          <div className={cn(
            'relative p-8',
            getRewardGradient(),
          )}
          >
            {/* Stars Animation */}
            <div className="absolute inset-0 overflow-hidden">
              {animation.starStyles.map(style => (
                <div
                  key={style.id}
                  className="animate-float absolute"
                  style={style}
                >
                  <Star className="h-4 w-4 text-white/30" />
                </div>
              ))}
            </div>

            {/* Icon */}
            <div className="relative mb-4 flex justify-center">
              <div className="animate-bounce-slow">
                <div className={`
                  flex h-24 w-24 items-center justify-center rounded-full
                  bg-white/20 shadow-lg backdrop-blur-sm
                `}
                >
                  {getRewardIcon()}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2
              id="reward-title"
              className="mb-2 text-center text-2xl font-bold text-white"
            >
              {reward.title}
            </h2>

            {/* Value */}
            {reward.value && (
              <div className="mb-2 text-center">
                <span className="text-4xl font-bold text-white">
                  +
                  {reward.value}
                </span>
                <span className="ml-2 text-lg text-white/80">
                  {reward.type === 'xp' ? 'XP' : 'points'}
                </span>
              </div>
            )}

            {/* Description */}
            <p
              id="reward-description"
              className="text-center text-sm text-white/90"
            >
              {reward.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="bg-background p-6">
            <Button
              onClick={handleClose}
              className="w-full"
              size="lg"
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}
      </style>
    </div>
  )
}
