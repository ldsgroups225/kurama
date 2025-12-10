---
inclusion: fileMatch
fileMatchPattern: "**/*{auth,login,session}*.{ts,tsx}"
---

# Authentication Guide (Better Auth)

## Client Setup
```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
})

export const { useSession, signIn, signOut, signUp } = authClient
```

## Server Setup
```typescript
// @kurama/data-ops/auth/setup.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Send email
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

## Authentication Methods

### Email OTP
```typescript
// Request OTP
await authClient.emailOtp.sendVerificationOtp({
  email: "user@example.com",
  type: "sign-in",
})

// Verify OTP
await authClient.emailOtp.verifyEmail({
  email: "user@example.com",
  otp: "123456",
})
```

### Google OAuth
```typescript
// Initiate Google sign-in
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/app",
})
```

## Protected Routes
```tsx
// _auth/route.tsx
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession()
    
    if (!session) {
      throw redirect({ to: "/login" })
    }
    
    return { user: session.user }
  },
  component: AuthLayout,
})
```

## Session Hook
```tsx
export function useAuth() {
  const { data: session, isPending } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: isPending,
  }
}
```

## API Route
```tsx
// routes/api/auth.$.tsx
import { auth } from "@kurama/data-ops/auth/setup"

export const Route = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => auth.handler(request),
  POST: ({ request }) => auth.handler(request),
})
```

## Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure cookie options
- [ ] Implement rate limiting
- [ ] Validate redirect URLs
- [ ] Log authentication events
