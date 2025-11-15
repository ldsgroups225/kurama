import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLessonsBySubject } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import { BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth/app/subjects/$subjectId")({
  component: LessonsPage,
});

function LessonsPage() {
  const { subjectId } = useParams({ from: "/_auth/app/subjects/$subjectId" });
  const navigate = useNavigate();

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-lessons");
    return endTracking;
  }, []);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", subjectId],
    queryFn: () => getLessonsBySubject({ data: Number(subjectId) }),
  });

  // Get subject name from first lesson (all lessons have same subject)
  const subjectName = lessons?.[0]?.subject?.name || "Leçons";

  const difficultyColors: Record<string, string> = {
    easy: "bg-success text-success",
    medium: "bg-warning text-warning",
    hard: "bg-error text-error",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
  };

  const difficultyEmojis: Record<string, string> = {
    easy: "😊",
    medium: "🤔",
    hard: "💪",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title={subjectName}
        showAvatar={false}
        showBackButton
        onBackClick={() => navigate({ to: "/app/subjects" })}
      />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Motivational Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2">Choisis ta leçon 📚</h2>
          <p className="text-muted-foreground">Chaque leçon te rapproche de ton objectif !</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {lessons && lessons.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Aucune leçon disponible</p>
              <p className="text-sm text-muted-foreground">
                De nouvelles leçons arrivent bientôt ! 🚀
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          {lessons?.map((lesson, index) => (
            <Link
              key={lesson.id}
              to="/app/lessons/$lessonId"
              params={{ lessonId: String(lesson.id) }}
            >
              <Card className="group hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer border-2 hover:border-primary/50 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Lesson Number Badge */}
                <div className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shadow-sm">
                  {index + 1}
                </div>

                <CardHeader className="pb-2 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </CardTitle>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {lesson.difficulty && (
                      <Badge
                        variant="secondary"
                        className={`${difficultyColors[lesson.difficulty] || ""} font-medium text-xs`}
                      >
                        {difficultyEmojis[lesson.difficulty]} {difficultyLabels[lesson.difficulty] || lesson.difficulty}
                      </Badge>
                    )}
                    {lesson.estimatedDuration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">{lesson.estimatedDuration} min</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
