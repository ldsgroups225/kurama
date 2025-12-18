import { betterAuth, type BetterAuthOptions } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { userProfiles } from "../drizzle/schema";

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
            console.warn(`[Email OTP] Type: ${type}, Email: ${email}, OTP: ${otp}`);
          }
        },
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        allowedAttempts: 3,
        disableSignUp: false,
      }),
    ],
    hooks: {
      after: async (ctx: any) => {
        // Store referral code when user signs up
        if (ctx.path === "/sign-up/email" && ctx.method === "POST") {
          const referralCode = ctx.body?.referralCode as string | undefined;

          if (referralCode && ctx.returned?.user?.id) {
            try {
              const db = config.database as any; // Type assertion for Drizzle

              // Update user profile with referral code
              await db
                .update(userProfiles)
                .set({
                  referredBy: referralCode.toUpperCase(),
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(userProfiles.userId, ctx.returned.user.id));

              console.warn(`Referral tracked: User ${ctx.returned.user.id} referred by ${referralCode}`);
            } catch (error) {
              console.error('Error storing referral code:', error);
            }
          }
        }
      },
    },
  });
};
