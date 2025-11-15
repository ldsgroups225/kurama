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

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Motivational Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2">Quelle matière aujourd'hui ? 🎯</h2>
          <p className="text-muted-foreground">Choisis ta matière préférée et commence à apprendre !</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
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
                <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-2 hover:border-primary/50 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} shadow-lg group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                            {subject.name}
                          </CardTitle>
                          {subject.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
