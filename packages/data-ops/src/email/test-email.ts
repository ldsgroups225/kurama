#!/usr/bin/env tsx
/**
 * Test script for Resend email integration
 * Usage: tsx packages/data-ops/src/email/test-email.ts
 */

import { config } from 'dotenv'
import { resolve } from "path";

import { createSendVerificationOTP } from "./resend";

const TO_EMAIL = 'kassidarius@gmail.com'

config({ path: resolve(__dirname, "../../.env.development") });

async function testEmailSending() {
  console.log("🧪 Testing Kurama email sending with Resend...");

  const sendVerificationOTP = createSendVerificationOTP({
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'noreply@kurama.ci',
    fromName: "Kurama",
  });

  try {
    // Test sign-in email
    console.log("📧 Sending test sign-in email...");
    await sendVerificationOTP({
      email: TO_EMAIL,
      otp: "123456",
      type: "sign-in",
    });

    console.log("✅ Sign-in email sent successfully!");

    // Test email verification
    console.log("📧 Sending test email verification...");
    await sendVerificationOTP({
      email: TO_EMAIL,
      otp: "789012",
      type: "email-verification",
    });

    console.log("✅ Email verification sent successfully!");

    // Test password reset
    console.log("📧 Sending test password reset...");
    await sendVerificationOTP({
      email: TO_EMAIL,
      otp: "345678",
      type: "forget-password",
    });

    console.log("✅ Password reset email sent successfully!");
    console.log("🎉 All email tests passed!");

  } catch (error) {
    console.error("❌ Email test failed:", error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailSending().catch(console.error);
}

export { testEmailSending };
