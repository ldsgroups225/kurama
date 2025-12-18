import { Resend } from "resend";
import { render } from "@react-email/components";
import { OTPEmail } from "./templates/otp-email";

export interface ResendConfig {
  apiKey: string;
  fromEmail?: string;
  fromName?: string;
}

export interface SendOTPParams {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

const subjectByType = {
  "sign-in": "Votre code de connexion Kurama",
  "email-verification": "Vérifiez votre email Kurama",
  "forget-password": "Réinitialisation mot de passe Kurama",
};

/**
 * Create a Resend email client for sending OTP emails
 */
export function createResendClient(config: ResendConfig) {
  const resend = new Resend(config.apiKey);
  const fromEmail = config.fromEmail ?? "noreply@kurama.ci";
  const fromName = config.fromName ?? "Kurama";

  return {
    /**
     * Send OTP verification email
     */
    async sendOTP({ email, otp, type }: SendOTPParams) {
      const subject = subjectByType[type];

      // Render the React Email template
      const html = await render(
        OTPEmail({
          otp,
          type,
          expiresInMinutes: 5,
        })
      );

      // Fallback for better accessibility
      const actionText = {
        "sign-in": "vous connecter à votre espace étudiant",
        "email-verification": "vérifier votre adresse email sur",
        "forget-password": "réinitialiser votre mot de passe",
      }[type];

      const text = `Bonjour,

Voici votre code de vérification pour ${actionText} Kurama :

${otp}

Ce code est valide pendant 5 minutes uniquement.

IMPORTANT : Ne partagez jamais ce code avec qui que ce soit. L'équipe Kurama ne vous demandera jamais votre code par téléphone ou email.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.

Besoin d'aide ? Visitez https://kurama.ci

L'équipe Kurama
Abidjan, Côte d'Ivoire`;

      try {
        const { data, error } = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: email,
          subject,
          html,
          text,
          tags: [
            { name: "category", value: "auth" },
            { name: "type", value: type },
            { name: "environment", value: process.env.NODE_ENV || "development" },
          ],
        });

        if (error) {
          console.error("[Resend] Failed to send OTP email:", error);
          throw new Error(`Failed to send email: ${error.message}`);
        }

        console.log(`[Resend] OTP email sent successfully to ${email}, ID: ${data?.id}`);
        return data;
      } catch (error) {
        console.error("[Resend] Email sending error:", error);
        throw new Error(`Email service error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  };
}

/**
 * Create sendVerificationOTP handler for Better Auth
 */
export function createSendVerificationOTP(config: ResendConfig) {
  const client = createResendClient(config);

  return async (params: SendOTPParams) => {
    await client.sendOTP(params);
  };
}
