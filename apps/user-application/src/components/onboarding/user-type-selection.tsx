import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ArrowRight } from "lucide-react";
import type { UserType } from "@kurama/data-ops/zod-schema/profile";

interface UserTypeSelectionProps {
  onSelect: (userType: UserType) => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className="flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Bienvenue sur Kurama
          </h1>
          <p className="text-g text-zinc-600 dark:text-zinc-400">
            Pour commencer, dites-nous qui vous êtes
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Student Card */}
          <Card
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-orange-500 bg-white dark:bg-zinc-900"
            onClick={() => onSelect("student")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-20 rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                  <GraduationCap className="size-10 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Étudiant
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Je veux apprendre pour réussir mon BEPC ou BAC
                </p>
              </div>
              <Button
                className="w-full group-hover:bg-orange-600 transition-colors"
                size="lg"
              >
                Continuer
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Parent Card */}
          <Card
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-orange-500 bg-white dark:bg-zinc-900"
            onClick={() => onSelect("parent")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  <Users className="size-10 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Parent
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Je veux suivre la progression de mes enfants
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
              >
                Continuer
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-8">
          En continuant, vous acceptez nos{" "}
          <a href="#" className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 underline">
            Conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 underline">
            Politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
}
