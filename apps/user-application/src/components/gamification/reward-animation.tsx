import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Star, Zap } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface Reward {
  type: "xp" | "achievement" | "level_up" | "streak";
  title: string;
  description: string;
  value?: number;
  icon?: React.ReactNode;
}

interface RewardAnimationProps {
  reward: Reward;
  onClose: () => void;
  show: boolean;
}

export function RewardAnimation({ reward, onClose, show }: RewardAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!show && !isVisible) return null;

  const getRewardIcon = () => {
    if (reward.icon) return reward.icon;

    switch (reward.type) {
      case "xp":
        return <Zap className="h-12 w-12 text-blue-500" />;
      case "achievement":
        return <Trophy className="h-12 w-12 text-amber-500" />;
      case "level_up":
        return <Star className="h-12 w-12 text-purple-500" />;
      case "streak":
        return <Sparkles className="h-12 w-12 text-orange-500" />;
      default:
        return <Trophy className="h-12 w-12 text-primary" />;
    }
  };

  const getRewardColor = () => {
    switch (reward.type) {
      case "xp":
        return "from-blue-400 to-blue-600";
      case "achievement":
        return "from-amber-400 to-orange-500";
      case "level_up":
        return "from-purple-400 to-purple-600";
      case "streak":
        return "from-orange-400 to-red-500";
      default:
        return "from-primary to-primary";
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleClose}
    >
      <Card
        className={cn(
          "max-w-sm w-full overflow-hidden shadow-2xl transition-all duration-300",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-0">
          {/* Animated Background */}
          <div className={cn(
            "relative p-8 bg-linear-to-br",
            getRewardColor()
          )}>
            {/* Sparkles Animation */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-white/30" />
                </div>
              ))}
            </div>

            {/* Icon */}
            <div className="relative flex justify-center mb-4">
              <div className="animate-bounce-slow">
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  {getRewardIcon()}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {reward.title}
            </h2>

            {/* Value */}
            {reward.value && (
              <div className="text-center mb-2">
                <span className="text-4xl font-bold text-white">
                  +{reward.value}
                </span>
                <span className="text-lg text-white/80 ml-2">
                  {reward.type === "xp" ? "XP" : "points"}
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-white/90 text-center text-sm">
              {reward.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="p-6 bg-background">
            <Button
              onClick={handleClose}
              className="w-full"
              size="lg"
            >
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
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
      `}</style>
    </div>
  );
}
