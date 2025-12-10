import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function LogoLoader({ size = 'md', className }: LogoLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.img
        src="/pwa-192x192.png"
        alt="Chargement..."
        className={cn(sizeClasses[size], 'rounded-full')}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LogoLoader size="lg" />
    </div>
  )
}
