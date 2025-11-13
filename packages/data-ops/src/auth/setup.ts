import { betterAuth, type BetterAuthOptions } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export const createBetterAuth = (config: {
  database: BetterAuthOptions["database"];
  secret?: BetterAuthOptions["secret"];
  socialProviders?: BetterAuthOptions["socialProviders"];
  sendVerificationOTP?: (params: {
    email: string;
    otp: string;
    type: "sign-in" | "email-verification" | "forget-password";
  }) => Promise<void>;
}): ReturnType<typeof betterAuth> => {
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
            console.log(`[Email OTP] Type: ${type}, Email: ${email}, OTP: ${otp}`);
          }
        },
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        allowedAttempts: 3,
        disableSignUp: false,
      }),
    ],
  });
};
