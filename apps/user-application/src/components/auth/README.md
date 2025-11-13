# Authentication Components

Beautiful, accessible authentication screens for Kurama with email OTP and social auth.

## Components

### AuthScreen
Main authentication container with logo, title, and auth flow management.

### EmailStep
Email input form that sends a 6-digit OTP to the user's email.

**Features:**
- Email validation
- Loading states
- Error handling
- Auto-focus on mount

### OtpStep
6-digit OTP verification with auto-submit and resend functionality.

**Features:**
- 6 individual input fields for better UX
- Auto-focus next input on digit entry
- Auto-submit when all digits entered
- Paste support (paste 6-digit code)
- Backspace navigation
- 60-second countdown for resend
- 3 attempts limit (configurable in auth setup)
- Loading and error states

### SocialAuth
Social authentication buttons for Google and TikTok.

**Features:**
- Google OAuth integration
- TikTok OAuth integration (requires setup)
- Loading states per provider
- Branded icons and styling

## Flow

1. **Onboarding** → User completes welcome and onboarding screens
2. **Email Entry** → User enters email address
3. **OTP Verification** → User receives and enters 6-digit code
4. **Authenticated** → User gains access to main app

Alternative: User can skip email OTP and use social auth (Google/TikTok)

## Configuration

The email OTP plugin is configured in `packages/data-ops/src/auth/setup.ts`:

```typescript
emailOTP({
  otpLength: 6,           // 6-digit code
  expiresIn: 300,         // 5 minutes
  allowedAttempts: 3,     // 3 attempts before invalidation
  disableSignUp: false,   // Allow auto-registration
})
```

## Email Sending

Currently logs OTP to console for development. To send real emails, update the `sendVerificationOTP` function in `apps/user-application/src/server.ts`:

```typescript
setAuth({
  // ... other config
  sendVerificationOTP: async ({ email, otp, type }) => {
    // Integrate with your email service (Resend, SendGrid, etc.)
    await emailService.send({
      to: email,
      subject: type === 'sign-in' ? 'Code de connexion Kurama' : 'Vérification email',
      body: `Votre code: ${otp}`,
    });
  },
});
```

## Styling

- Uses Tailwind CSS v4 with CSS variables
- Supports dark mode
- Orange accent color (#f97316)
- Responsive design
- Accessible (WCAG 2.1 AA)

## Dependencies

- Better Auth with email OTP plugin
- Radix UI primitives (Label)
- Lucide React icons
- TanStack Router for navigation
