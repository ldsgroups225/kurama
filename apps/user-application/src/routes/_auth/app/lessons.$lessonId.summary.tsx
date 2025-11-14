import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { AppHeader } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  RotateCcw,
  Home,
  Check,
  X,
} from "lucide-react";

type SearchParams = {
  correct?: number;
  incorrect?: number;
  total?: number;
  duration?: number;
  mode?: string;
};

export const Route = createFileRoute("/_auth/app/lessons/$lessonId/summary")({
  component: SummaryPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      correct: Number(search.correct) || 0,
      incorrect: Number(search.incorrect) || 0,
      total: Number(search.total) || 0,
      duration: Number(search.duration) || 0,
      mode: (search.mode as string) || "flashcards",
    };
  },
});

function SummaryPage() {
  const { lessonId } = useParams({ from: "/_auth/app/lessons/$lessonId/summary" });
  const { correct, incorrect, total, duration, mode } = useSearch({
    from: "/_auth/app/lessons/$lessonId/summary",
  });
  const navigate = useNavigate();

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-summary");
    return endTracking;
  }, []);

  const score = (total ?? 0) > 0 ? Math.round(((correct ?? 0) / (total ?? 1)) * 100) : 0;
  const minutes = Math.floor((duration ?? 0) / 60);
  const seconds = (duration ?? 0) % 60;

  // Determine performance level
  let performanceLevel = "Bon travail!";
  let performanceColor = "text-info";
  let performanceIcon = Target;

  if (score >= 90) {
    performanceLevel = "Excellent!";
    performanceColor = "text-success";
    performanceIcon = Trophy;
  } else if (score >= 70) {
    performanceLevel = "Très bien!";
    performanceColor = "text-level";
    performanceIcon = TrendingUp;
  } else if (score < 50) {
    performanceLevel = "Continue à pratiquer";
    performanceColor = "text-warning";
  }

  const PerformanceIcon = performanceIcon;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Résumé" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Performance Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-level">
              <PerformanceIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${performanceColor}`}>
              {performanceLevel}
            </h2>
            <p className="text-muted-foreground">Session terminée</p>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-level text-white">
              <CardTitle className="text-center text-4xl font-bold">
                {score}%
              </CardTitle>
              <p className="text-center text-sm opacity-90">Score final</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success mx-auto">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{correct}</div>
                    <div className="text-xs text-muted-foreground">Correctes</div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error mx-auto">
                    <X className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{incorrect}</div>
                    <div className="text-xs text-muted-foreground">Incorrectes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground">Temps total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Cartes vues</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Earned (Placeholder for gamification) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-xp text-white">
            <CardContent className="py-6 text-center">
              <div className="text-3xl font-bold mb-1">+{(correct ?? 0) * 10} XP</div>
              <div className="text-sm opacity-90">Points d'expérience gagnés</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              navigate({
                to: "/app/lessons/$lessonId/session",
                params: { lessonId },
                search: { mode: mode as "flashcards" | "quiz" | "exam" },
              })
            }
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Recommencer
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate({ to: "/app" })}
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
