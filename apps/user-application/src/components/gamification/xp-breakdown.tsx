import { Flame, Sparkles, Target, Timer, Trophy, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface XPBreakdownProps {
  breakdown: {
    base: number
    streakBonus: number
    perfectBonus: number
    speedBonus: number
    passingBonus: number
  }
  totalXP: number
  className?: string
}

export function XPBreakdown({ breakdown, totalXP, className }: XPBreakdownProps) {
  const items = [
    { label: 'Réponses correctes', value: breakdown.base, icon: Target, show: breakdown.base > 0 },
    { label: 'Bonus série', value: breakdown.streakBonus, icon: Flame, show: breakdown.streakBonus > 0 },
    { label: 'Score parfait', value: breakdown.perfectBonus, icon: Sparkles, show: breakdown.perfectBonus > 0 },
    { label: 'Bonus rapidité', value: breakdown.speedBonus, icon: Timer, show: breakdown.speedBonus > 0 },
    { label: 'Bonus réussite', value: breakdown.passingBonus, icon: Trophy, show: breakdown.passingBonus > 0 },
  ].filter(item => item.show)

  return (
    <Card className={cn('overflow-hidden border-2 border-xp', className)}>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-gradient-xp flex h-8 w-8 items-center justify-center rounded-full">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">Détail des XP</span>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <span className="font-medium text-xp">
                  +
                  {item.value}
                </span>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: items.length * 0.1 }}
          className="mt-4 border-t border-border pt-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-xp">
              +
              {totalXP}
              {' '}
              XP
            </span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
