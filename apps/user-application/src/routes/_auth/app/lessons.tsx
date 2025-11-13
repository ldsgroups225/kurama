import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Atom,
  Globe,
  BookText,
  Languages,
  Landmark,
  Lock,
  Play
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/lessons")({
  component: LessonsPage,
});

const subjects = [
  {
    icon: Calculator,
    name: "Mathématiques",
    lessons: 45,
    completed: 28,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Atom,
    name: "Physique-Chimie",
    lessons: 38,
    completed: 15,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Globe,
    name: "Anglais",
    lessons: 32,
    completed: 20,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Languages,
    name: "Français",
    lessons: 40,
    completed: 32,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Landmark,
    name: "Histoire-Géo",
    lessons: 35,
    completed: 12,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: BookText,
    name: "Philosophie",
    lessons: 28,
    completed: 0,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

function LessonsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Mes Leçons" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          const progress = Math.round((subject.completed / subject.lessons) * 100);
          const isLocked = subject.completed === 0;

          return (
            <Card key={subject.name} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${subject.bgColor} ${subject.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{subject.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {subject.completed}/{subject.lessons} leçons
                      </p>
                    </div>
                  </div>
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Badge variant="secondary">{progress}%</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${subject.bgColor} rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Button
                  className="w-full"
                  variant={isLocked ? "outline" : "default"}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Bientôt Disponible
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Continuer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
