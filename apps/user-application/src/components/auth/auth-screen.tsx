import { useState } from "react";
import { EmailStep } from "./email-step";
import { OtpStep } from "./otp-step";
import { SocialAuth } from "./social-auth";

type AuthStep = "email" | "otp";

export function AuthScreen() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("otp");
  };

  const handleBackToEmail = () => {
    setStep("email");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Bienvenue sur Kurama
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connectez-vous pour continuer votre apprentissage
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          {step === "email" ? (
            <EmailStep onSubmit={handleEmailSubmit} />
          ) : (
            <OtpStep email={email} onBack={handleBackToEmail} />
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Social Auth */}
          <SocialAuth />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
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
