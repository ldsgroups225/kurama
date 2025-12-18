import { betterAuth, type BetterAuthOptions } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export type SendVerificationOTPParams = {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
};

export interface BetterAuthConfig {
  database: BetterAuthOptions["database"];
  secret?: BetterAuthOptions["secret"];
  socialProviders?: BetterAuthOptions["socialProviders"];
  /**
   * Custom OTP email sender. Use createSendVerificationOTP from @kurama/data-ops/email/resend
   * 
   * @example
   * ```ts
   * import { createSendVerificationOTP } from "@kurama/data-ops/email/resend";
   * 
   * const sendVerificationOTP = createSendVerificationOTP({
   *   apiKey: env.RESEND_API_KEY,
   *   fromEmail: "noreply@kurama.ci",
   *   fromName: "Kurama",
   * });
   * ```
   */
  sendVerificationOTP?: (params: SendVerificationOTPParams) => Promise<void>;
}

export const createBetterAuth = (config: BetterAuthConfig): ReturnType<typeof betterAuth> => {
  return betterAuth({
    database: config.database,
    secret: config.secret,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: config.socialProviders,
    user: {
      modelName: "auth_user",
    },
    session: {
      modelName: "auth_session",
    },
    verification: {
      modelName: "auth_verification",
    },
    account: {
      modelName: "auth_account",
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (config.sendVerificationOTP) {
            await config.sendVerificationOTP({ email, otp, type });
          } else {
            // Default: log to console (for development)
            console.warn(`[Email OTP] Type: ${type}, Email: ${email}, OTP: ${otp}`);
            console.warn("[Email OTP] Configure Resend to send real emails:");
            console.warn("  import { createSendVerificationOTP } from '@kurama/data-ops/email/resend'");
          }
        },
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        allowedAttempts: 3,
        disableSignUp: false,
      }),
    ],
    // Note: Referral tracking should be handled in the application layer
    // via a separate API call after sign-up, not in auth hooks
  });
};
