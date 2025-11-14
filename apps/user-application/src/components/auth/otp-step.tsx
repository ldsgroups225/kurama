import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";

interface OtpStepProps {
  email: string;
  onBack: () => void;
}

export function OtpStep({ email, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit) && index === 5) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);

    if (newOtp.every((digit) => digit)) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleSubmit = async (otpCode: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp: otpCode,
      });

      if (signInError) {
        setError(signInError.message || "Code invalide. Veuillez réessayer.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      // Success - redirect will happen automatically via session
      router.invalidate();
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    setError("");

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Impossible de renvoyer le code");
      setCanResend(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Changer d'email
      </button>

      {/* Instructions */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Entrez le code de vérification
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nous avons envoyé un code à 6 chiffres à
        </p>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mt-1">
          {email}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            className="w-12 h-14 text-center text-2xl font-semibold border-2 border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-center text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Vérification en cours...
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {canResend ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Renvoyer le code
          </Button>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Renvoyer le code dans {countdown}s
          </p>
        )}
      </div>
    </div>
  );
}

export default OtpStep;
