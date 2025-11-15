import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "motion/react";
import { AppHeader } from "@/components/main";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLessonDetails } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  X,
  Loader2,
  Settings,
  Volume2,
  Star,
  Play,
  Pause,
  Undo2,
} from "lucide-react";

type SearchParams = {
  mode?: "flashcards" | "quiz" | "exam";
};

export const Route = createFileRoute("/_auth/app/lesson-session/$lessonId")({
  component: SessionPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      mode: (search.mode as SearchParams["mode"]) || "flashcards",
    };
  },
});

function SessionPage() {
  const { lessonId } = useParams({ from: "/_auth/app/lesson-session/$lessonId" });
  const { mode } = useSearch({ from: "/_auth/app/lesson-session/$lessonId" });
  const navigate = useNavigate();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [startTime] = useState(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [cardOrientation, setCardOrientation] = useState<"term" | "definition">("term");
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  const [cardHistory, setCardHistory] = useState<number[]>([]);

  // Swipe gesture state
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);



  // Background color transitions based on swipe
  const cardBackgroundColor = useTransform(
    x,
    [-80, 0, 80],
    ["rgba(251, 146, 60, 0.1)", "rgba(255, 255, 255, 0)", "rgba(34, 197, 94, 0.1)"]
  );

  // Border color transitions
  const cardBorderColor = useTransform(
    x,
    [-80, 0, 80],
    ["rgba(251, 146, 60, 0.5)", "rgba(0, 0, 0, 0.1)", "rgba(34, 197, 94, 0.5)"]
  );

  // Counter badge transitions
  const correctBadgeBg = useTransform(
    x,
    [0, 80],
    ["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 1)"]
  );
  const correctBadgeScale = useTransform(x, [0, 80], [1, 1.15]);
  const showCorrectPreview = useTransform(x, [0, 80], [0, 1]);
  const hideCorrectCount = useTransform(x, [0, 80], [1, 0]);

  const incorrectBadgeBg = useTransform(
    x,
    [-80, 0],
    ["rgba(251, 146, 60, 1)", "rgba(251, 146, 60, 0.1)"]
  );
  const incorrectBadgeScale = useTransform(x, [-80, 0], [1.15, 1]);
  const showIncorrectPreview = useTransform(x, [-80, 0], [1, 0]);
  const hideIncorrectCount = useTransform(x, [-80, 0], [0, 1]);

  // Calculate dynamic card height based on viewport
  const cardHeight = useMemo(() => {
    if (viewportHeight === 0) return 500;

    // Header height (~57px) + Progress bar (4px) + Counter badges (~56px) + Action buttons (~120px) + Padding (~48px)
    const reservedSpace = 285;
    const availableHeight = viewportHeight - reservedSpace;

    // Ensure minimum height of 300px and maximum of 600px
    return Math.max(300, Math.min(600, availableHeight));
  }, [viewportHeight]);

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-session");
    return endTracking;
  }, []);

  // Update viewport height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
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
    // Only flip if not dragging
    if (!isDragging) {
      setIsFlipped(!isFlipped);
    }
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
        to: "/app/lesson-summary/$lessonId",
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
      x.set(0);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    const velocity = Math.abs(info.velocity.x);

    // Reset dragging state after a short delay to prevent flip on drag end
    setTimeout(() => setIsDragging(false), 100);

    // Consider both distance and velocity for better swipe detection
    if (info.offset.x > threshold || (info.offset.x > 50 && velocity > 500)) {
      // Swipe right - mark as correct
      handleResponse("correct");
    } else if (info.offset.x < -threshold || (info.offset.x < -50 && velocity > 500)) {
      // Swipe left - mark as incorrect
      handleResponse("incorrect");
    } else {
      // Return to center with spring animation
      x.set(0);
    }
  };

  const handlePrevCard = () => {
    if (cardHistory.length > 0) {
      const previousIndex = cardHistory[cardHistory.length - 1];
      if (previousIndex !== undefined) {
        setCardHistory((prev) => prev.slice(0, -1));
        setCurrentCardIndex(previousIndex);
        setIsFlipped(false);
        x.set(0);

        // Stop auto-play when manually going back
        if (isAutoPlaying) {
          stopAutoPlay();
        }
      }
    }
  };

  const goToNextCard = () => {
    // Save current index to history
    setCardHistory((prev) => [...prev, currentCardIndex]);

    // Loop back to start if at last card
    if (currentCardIndex === cards.length - 1) {
      setCurrentCardIndex(0);

      // Reset counters when completing a loop in autoplay mode
      if (isAutoPlaying) {
        setSessionStats({
          correct: 0,
          incorrect: 0,
          skipped: 0,
        });
      }
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
    setIsFlipped(false);
    x.set(0);
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      setAutoPlayTimer(null);
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      setIsAutoPlaying(true);
    }
  };

  // Autoplay effect - runs when isAutoPlaying changes or card changes
  useEffect(() => {
    if (!isAutoPlaying || cards.length === 0) {
      return;
    }

    // Wait 4 seconds, then flip card
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);

      // Wait another 4 seconds, then animate swipe right and go to next
      const nextTimer = setTimeout(() => {
        // Animate swipe right progressively (natural feel)
        let currentX = 0;
        const targetX = 250;
        const duration = 600; // 600ms for smooth animation
        const startTime = Date.now();

        const animateSwipe = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic for natural deceleration
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          currentX = targetX * easeProgress;

          x.set(currentX);

          if (progress < 1) {
            requestAnimationFrame(animateSwipe);
          } else {
            // Animation complete, mark correct and go to next
            setSessionStats((prev) => ({
              ...prev,
              correct: prev.correct + 1,
            }));
            goToNextCard();
          }
        };

        animateSwipe();
      }, 4000);

      setAutoPlayTimer(nextTimer);
    }, isFlipped ? 0 : 4000);

    setAutoPlayTimer(flipTimer);

    return () => {
      clearTimeout(flipTimer);
    };
  }, [isAutoPlaying, currentCardIndex, isFlipped, cards.length]);

  // Cleanup auto-play timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
      }
    };
  }, [autoPlayTimer]);

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
      {/* Header with counter and settings */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate({
                to: "/app/lessons/$lessonId",
                params: { lessonId },
              })
            }
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {currentCardIndex + 1} / {cards.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <main className="mx-auto max-w-lg py-6">
        {/* Counter badges */}
        <div className="flex items-center justify-between mb-6">
          {/* Incorrect counter */}
          <motion.div
            className="py-2 text-base font-semibold rounded-r-full w-20 border-2 border-warning/20 relative overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: incorrectBadgeBg,
              scale: incorrectBadgeScale,
            }}
          >
            <motion.span
              className="text-warning relative z-10"
              style={{
                opacity: hideIncorrectCount,
              }}
            >
              {sessionStats.incorrect}
            </motion.span>
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-white font-bold z-10"
              style={{
                opacity: showIncorrectPreview,
              }}
            >
              +1
            </motion.span>
          </motion.div>

          {/* Correct counter */}
          <motion.div
            className="py-2 text-base font-semibold rounded-l-full w-20 border-2 border-success/20 relative overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: correctBadgeBg,
              scale: correctBadgeScale,
            }}
          >
            <motion.span
              className="text-success relative z-10"
              style={{
                opacity: hideCorrectCount,
              }}
            >
              {sessionStats.correct}
            </motion.span>
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-white font-bold z-10"
              style={{
                opacity: showCorrectPreview,
              }}
            >
              +1
            </motion.span>
          </motion.div>
        </div>

        {/* Flashcard with swipe gesture */}
        <div
          className="relative flex items-center justify-center mx-4"
          style={{ height: `${cardHeight}px` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: -250, right: 250 }}
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              onDragStart={() => setIsDragging(true)}
              className="absolute inset-0 touch-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >


                {/* Front Face */}
                <motion.div
                  className="absolute inset-0 h-full shadow-xl rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                  onClick={handleFlip}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    backgroundColor: cardBackgroundColor,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: cardBorderColor,
                  }}
                >
                  <Card className="h-full border-0 bg-transparent shadow-none">

                    {/* Card actions */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-auto bg-background/80 backdrop-blur"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-auto bg-background/80 backdrop-blur"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                      <div className="space-y-6 text-center w-full">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {cardOrientation === "term" ? "Terme" : "Définition"}
                        </div>
                        <p className="text-2xl font-medium leading-relaxed px-4">
                          {cardOrientation === "term"
                            ? currentCard.frontContent
                            : currentCard.backContent}
                        </p>
                      </div>

                      {/* Tap to flip hint */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-8 left-0 right-0 text-center"
                      >
                        <p className="text-xs text-muted-foreground">
                          Appuyez pour retourner
                        </p>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Back Face */}
                <motion.div
                  className="absolute inset-0 h-full shadow-xl rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                  onClick={handleFlip}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: cardBackgroundColor,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: cardBorderColor,
                  }}
                >
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    {/* Card actions */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-auto bg-background/80 backdrop-blur"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-auto bg-background/80 backdrop-blur"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                      <div className="space-y-6 text-center w-full">
                        <div className="text-xs font-semibold text-success uppercase tracking-wider">
                          {cardOrientation === "term" ? "Définition" : "Terme"}
                        </div>
                        <p className="text-xl leading-relaxed px-4">
                          {cardOrientation === "term"
                            ? currentCard.backContent
                            : currentCard.frontContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation and action buttons */}
        <div className="mt-8">
          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevCard}
              disabled={cardHistory.length === 0}
              className="h-12 w-12 rounded-full disabled:opacity-30"
            >
              <Undo2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAutoPlay}
              className="h-12 w-12 rounded-full"
            >
              {isAutoPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Options</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Card orientation toggle */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Orientation des cartes</h3>
              <div className="flex gap-2">
                <Button
                  variant={cardOrientation === "term" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCardOrientation("term")}
                >
                  Terme
                </Button>
                <Button
                  variant={cardOrientation === "definition" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCardOrientation("definition")}
                >
                  Définition
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recto
              </p>
            </div>

            {/* Reset progress */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-primary"
                onClick={() => {
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setSessionStats({ correct: 0, incorrect: 0, skipped: 0 });
                  setShowSettings(false);
                  x.set(0);
                }}
              >
                Parcourir à nouveau les cartes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
