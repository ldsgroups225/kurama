import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLessonDetails } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  BookOpen,
  Clock,
  CreditCard,
  ListChecks,
  FileText,
  Loader2,
  ArrowLeft,
  Play,
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/lessons/$lessonId")({
  component: LessonModePage,
});

type LearningMode = "flashcards" | "quiz" | "exam";

const learningModes = [
  {
    id: "flashcards" as LearningMode,
    name: "Flashcards",
    description: "Révision avec des cartes mémoire interactives",
    icon: CreditCard,
    color: "bg-gradient-xp",
    textColor: "text-xp",
  },
  {
    id: "quiz" as LearningMode,
    name: "Quiz",
    description: "Testez vos connaissances avec des questions",
    icon: ListChecks,
    color: "bg-gradient-level",
    textColor: "text-level",
  },
  {
    id: "exam" as LearningMode,
    name: "Examen",
    description: "Simulation d'examen chronométré",
    icon: FileText,
    color: "bg-gradient-streak",
    textColor: "text-streak",
  },
];

function LessonModePage() {
  const { lessonId } = useParams({ from: "/_auth/app/lessons/$lessonId" });
  const navigate = useNavigate();
  const [showModeDialog, setShowModeDialog] = useState(false);

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-lesson-mode");
    return endTracking;
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  });

  const handleModeSelect = (mode: LearningMode) => {
    setShowModeDialog(false);
    navigate({
      to: "/app/lessons/$lessonId/session",
      params: { lessonId },
      search: { mode },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Leçon" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Leçon" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Leçon introuvable</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const lessonData = lesson as any;

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={lessonData?.subject?.name || "Leçon"} showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              to: "/app/subjects/$subjectId",
              params: { subjectId: String(lessonData?.subjectId) },
            })
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux leçons
        </Button>

        {/* Lesson Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{lessonData?.title}</CardTitle>
                {lessonData?.description && (
                  <p className="text-sm text-muted-foreground">
                    {lessonData.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {lessonData?.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{lessonData.estimatedDuration} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <span>{lessonData?.cards?.length || 0} cartes</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowModeDialog(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Commencer la leçon
            </Button>
          </CardContent>
        </Card>

        {/* Learning Modes Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Modes d'apprentissage disponibles
          </h3>
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card key={mode.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode.color}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{mode.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Mode Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisir un mode d'apprentissage</DialogTitle>
            <DialogDescription>
              Sélectionnez comment vous souhaitez étudier cette leçon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {learningModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode.color} shrink-0`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{mode.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
