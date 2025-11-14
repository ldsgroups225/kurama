import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjects } from "@/core/functions/learning";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  Calculator,
  Atom,
  Globe,
  BookText,
  Languages,
  Landmark,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/subjects/")({
  component: SubjectsPage,
});

// Icon mapping for subjects
const subjectIcons: Record<string, typeof Calculator> = {
  "Mathématiques": Calculator,
  "Physique-Chimie": Atom,
  "Anglais": Globe,
  "Français": Languages,
  "Histoire-Géo": Landmark,
  "Philosophie": BookText,
};

// Color mapping for subjects
const subjectColors: Record<string, { text: string; bg: string }> = {
  "Mathématiques": { text: "text-subject-math", bg: "bg-subject-math" },
  "Physique-Chimie": { text: "text-subject-physics", bg: "bg-subject-physics" },
  "Anglais": { text: "text-subject-english", bg: "bg-subject-english" },
  "Français": { text: "text-subject-french", bg: "bg-subject-french" },
  "Histoire-Géo": { text: "text-subject-history", bg: "bg-subject-history" },
  "Philosophie": { text: "text-subject-philosophy", bg: "bg-subject-philosophy" },
};

function SubjectsPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad("app-subjects");
    return endTracking;
  }, []);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => getSubjects(),
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Matières" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {subjects?.map((subject) => {
          const Icon = subjectIcons[subject.name] || BookText;
          const colors = subjectColors[subject.name] || {
            text: "text-primary",
            bg: "bg-primary",
          };

          return (
            <Link
              key={subject.id}
              to="/app/subjects/$subjectId"
              params={{ subjectId: String(subject.id) }}
            >
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{subject.name}</CardTitle>
                        {subject.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
