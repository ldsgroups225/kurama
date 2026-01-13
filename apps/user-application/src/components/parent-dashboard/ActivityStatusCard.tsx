import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type ActivityStatus = 'active' | 'warning' | 'inactive'

interface ActivityStatusCardProps {
  childName: string
  childImage?: string
  lastActiveAt: Date | null
  status: ActivityStatus
  className?: string
}

/**
 * Activity Status Card
 *
 * Shows child's current activity status with color-coded badge:
 * - 🟢 Active (today)
 * - 🟡 Warning (2-3 days)
 * - 🔴 Inactive (4+ days)
 */
export function ActivityStatusCard({
  childName,
  childImage,
  lastActiveAt,
  status,
  className,
}: ActivityStatusCardProps) {
  const getStatusConfig = (s: ActivityStatus) => {
    switch (s) {
      case 'active':
        return {
          label: 'Actif',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        }
      case 'warning':
        return {
          label: 'Inactif 2-3j',
          color: 'bg-amber-500',
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
        }
      case 'inactive':
        return {
          label: 'Inactif 4j+',
          color: 'bg-red-500',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        }
    }
  }

  const statusConfig = getStatusConfig(status)

  const getRelativeTime = (date: Date | null) => {
    if (!date)
      return 'Jamais connecté'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1)
      return 'À l\'instant'
    if (diffMins < 60)
      return `Il y a ${diffMins} min`
    if (diffHours < 24)
      return `Il y a ${diffHours}h`
    if (diffDays === 1)
      return 'Hier'
    return `Il y a ${diffDays} jours`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md',
        statusConfig.bgColor,
        statusConfig.borderColor,
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar with status ring */}
        <div className="relative">
          <Avatar className={cn('h-14 w-14 border-2', statusConfig.borderColor)}>
            <AvatarImage src={childImage} />
            <AvatarFallback className={cn('text-lg font-bold', statusConfig.bgColor, statusConfig.textColor)}>
              {getInitials(childName)}
            </AvatarFallback>
          </Avatar>
          {/* Status dot */}
          <span className={cn(
            'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background',
            statusConfig.color,
          )}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{childName}</h3>
          <p className="text-sm text-muted-foreground">{getRelativeTime(lastActiveAt)}</p>
        </div>

        {/* Status badge */}
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-bold',
          statusConfig.bgColor,
          statusConfig.textColor,
        )}
        >
          {statusConfig.label}
        </span>
      </div>
    </motion.div>
  )
}
