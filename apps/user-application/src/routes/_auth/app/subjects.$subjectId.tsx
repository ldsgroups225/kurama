import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLessonsBySubject } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import type { SelectLesson } from "@kurama/data-ops/drizzle/schema";
import { BookOpen, Clock, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_auth/app/subjects/$subjectId")({
  component: LessonsPage,
});

function LessonsPage() {
  const { subjectId } = useParams({ from: "/_auth/app/subjects/$subjectId" });

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-lessons");
    return endTracking;
  }, []);

  const { data: lessons, isLoading } = useQuery<SelectLesson[]>({
    queryKey: ["lessons", subjectId],
    queryFn: () => getLessonsBySubject({ data: Number(subjectId) }),
  });

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Leçons" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <Link to="/app/subjects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux matières
          </Button>
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {lessons && lessons.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucune leçon disponible pour le moment
              </p>
            </CardContent>
          </Card>
        )}

        {lessons?.map((lesson) => (
          <Link
            key={lesson.id}
            to="/app/lessons/$lessonId"
            params={{ lessonId: String(lesson.id) }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{lesson.title}</CardTitle>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {lesson.difficulty && (
                    <Badge
                      variant="secondary"
                      className={difficultyColors[lesson.difficulty] || ""}
                    >
                      {difficultyLabels[lesson.difficulty] || lesson.difficulty}
                    </Badge>
                  )}
                  {lesson.estimatedDuration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.estimatedDuration} min</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
