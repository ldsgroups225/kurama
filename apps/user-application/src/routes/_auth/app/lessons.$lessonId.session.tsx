import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppHeader } from "@/components/main";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLessonDetails } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  RotateCcw,
  Check,
  X,
  Loader2,
  ChevronLeft,
} from "lucide-react";

type SearchParams = {
  mode?: "flashcards" | "quiz" | "exam";
};

export const Route = createFileRoute("/_auth/app/lessons/$lessonId/session")({
  component: SessionPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      mode: (search.mode as SearchParams["mode"]) || "flashcards",
    };
  },
});

function SessionPage() {
  const { lessonId } = useParams({ from: "/_auth/app/lessons/$lessonId/session" });
  const { mode } = useSearch({ from: "/_auth/app/lessons/$lessonId/session" });
  const navigate = useNavigate();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [startTime] = useState(Date.now());

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-session");
    return endTracking;
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  });

  const cards = (lesson as any)?.cards ?? [];
  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;
  const isLastCard = currentCardIndex === cards.length - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (response: "correct" | "incorrect") => {
    setSessionStats((prev) => ({
      ...prev,
      [response]: prev[response] + 1,
    }));

    if (isLastCard) {
      // Navigate to summary
      const duration = Math.floor((Date.now() - startTime) / 1000);
      navigate({
        to: "/app/lessons/$lessonId/summary",
        params: { lessonId },
        search: {
          correct: sessionStats.correct + (response === "correct" ? 1 : 0),
          incorrect: sessionStats.incorrect + (response === "incorrect" ? 1 : 0),
          total: cards.length,
          duration,
          mode,
        },
      });
    } else {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Session" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!lesson || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Session" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Aucune carte disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={(lesson as any)?.title || "Session"} showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Carte {currentCardIndex + 1} sur {cards.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">{sessionStats.correct}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error">
              <X className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">{sessionStats.incorrect}</span>
          </div>
        </div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className="min-h-[400px] cursor-pointer"
              onClick={handleFlip}
            >
              <CardContent className="flex items-center justify-center p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isFlipped ? "back" : "front"}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full"
                  >
                    {!isFlipped ? (
                      <div className="space-y-4">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Question
                        </div>
                        <p className="text-lg font-medium leading-relaxed">
                          {currentCard.frontContent}
                        </p>
                        <div className="pt-8">
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retourner
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Réponse
                        </div>
                        <p className="text-lg leading-relaxed">
                          {currentCard.backContent}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-error text-error hover:bg-error hover:text-white"
              onClick={() => handleResponse("incorrect")}
            >
              <X className="h-5 w-5 mr-2" />
              Incorrect
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-success hover:bg-success/90"
              onClick={() => handleResponse("correct")}
            >
              <Check className="h-5 w-5 mr-2" />
              Correct
            </Button>
          </motion.div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() =>
            navigate({
              to: "/app/lessons/$lessonId",
              params: { lessonId },
            })
          }
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quitter la session
        </Button>
      </main>
    </div>
  );
}
