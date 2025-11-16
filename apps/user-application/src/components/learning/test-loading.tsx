import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

export function TestLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="bg-gradient-streak flex h-24 w-24 items-center justify-center rounded-full"
        >
          <Loader2 className="h-12 w-12 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="mb-2 text-2xl font-bold">Un instant. Nous compilons vos résultats.</h2>
        <p className="text-base text-muted-foreground">
          Analyse de vos réponses en cours...
        </p>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
            className="h-3 w-3 rounded-full bg-primary"
          />
        ))}
      </motion.div>
    </div>
  )
}
