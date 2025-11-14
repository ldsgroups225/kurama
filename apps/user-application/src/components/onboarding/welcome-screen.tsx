"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ArrowRight,
  Target,
  Smartphone,
  Trophy,
  Star,
  BookOpen,
} from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
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
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const floatVariants = {
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="max-w-sm w-full space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Icon */}
          <motion.div
            className="flex justify-center relative"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div
                className="w-40 h-40 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
                variants={iconVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <GraduationCap
                  className="w-20 h-20 text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
              {/* Decorative icons */}
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                variants={floatVariants}
                animate="animate"
              >
                <Star className="w-5 h-5 text-white" fill="currentColor" />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg"
                variants={pulseVariants}
                animate="animate"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="space-y-3 text-center"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Bienvenue sur{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-purple-600">
                Kurama
              </span>
            </h1>
            <p className="text-base text-gray-600 leading-relaxed px-2">
              Votre compagnon d'apprentissage intelligent pour réussir le BEPC
              et le BAC en Côte d'Ivoire
            </p>
          </motion.div>

          {/* Features */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.div
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-6 h-6 text-orange-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Apprentissage personnalisé
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Adapté à votre rythme et niveau
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Smartphone className="w-6 h-6 text-purple-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Disponible hors ligne
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Étudiez n'importe où, n'importe quand
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="w-6 h-6 text-blue-600" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Suivi de progression
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Badges, défis et récompenses
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="px-6 pb-8 space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="w-full bg-linear-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            Commencer l'aventure
            <motion.div
              className="inline-block ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Déjà un compte?{" "}
          <motion.button
            onClick={onGetStarted}
            className="text-purple-600 hover:text-purple-700 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Se connecter
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default WelcomeScreen;
