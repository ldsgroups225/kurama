import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLessonDetails } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  BookOpen,
  Clock,
  CreditCard,
  ListChecks,
  FileText,
  Loader2,
  ChevronRight,
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
    emoji: "🎴",
    benefit: "Mémorise facilement",
  },
  {
    id: "quiz" as LearningMode,
    name: "Quiz",
    description: "Testez vos connaissances avec des questions",
    icon: ListChecks,
    color: "bg-gradient-level",
    textColor: "text-level",
    emoji: "🎯",
    benefit: "Teste tes connaissances",
  },
  {
    id: "exam" as LearningMode,
    name: "Examen",
    description: "Simulation d'examen chronométré",
    icon: FileText,
    color: "bg-gradient-streak",
    textColor: "text-streak",
    emoji: "📝",
    benefit: "Prépare-toi comme un pro",
  },
];

function LessonModePage() {
  const { lessonId } = useParams({ from: "/_auth/app/lessons/$lessonId" });
  const navigate = useNavigate();

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-lesson-mode");
    return endTracking;
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  });

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
      <AppHeader
        title={lessonData?.subject?.name || "Leçon"}
        showAvatar={false}
        showBackButton
        onBackClick={() =>
          navigate({
            to: "/app/subjects/$subjectId",
            params: { subjectId: String(lessonData?.subjectId) },
          })
        }
      />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Lesson Overview Card */}
        <Card className="border-2 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{lessonData?.title}</CardTitle>
                {lessonData?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lessonData.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 flex-wrap">
              {lessonData?.estimatedDuration && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{lessonData.estimatedDuration} min</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">{lessonData?.cards?.length || 0} cartes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Header */}
        <div className="text-center py-2">
          <h2 className="text-xl font-bold mb-1">Choisis ton mode d'apprentissage 🎯</h2>
          <p className="text-sm text-muted-foreground">Sélectionne comment tu veux étudier cette leçon</p>
        </div>

        {/* Learning Modes - Clickable Cards */}
        <div className="grid grid-cols-1 gap-4">
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() =>
                  navigate({
                    to: "/app/lessons/$lessonId/session",
                    params: { lessonId },
                    search: { mode: mode.id },
                  })
                }
              >
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border-2 hover:border-primary/50 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${mode.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {mode.name}
                            </CardTitle>
                            <span className="text-xl">{mode.emoji}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {mode.description}
                          </p>
                          <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                            {mode.benefit}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
