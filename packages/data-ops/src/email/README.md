# Kurama Email System

Professional email system for Kurama using Resend and React Email templates.

## Features

- 🎨 **Beautiful React Email Templates** - Modern, responsive design optimized for all email clients
- 🔐 **Secure OTP Delivery** - 6-digit codes with 5-minute expiration
- 🌍 **Localized for Côte d'Ivoire** - French language with local context
- 📱 **Mobile-First Design** - Optimized for mobile email clients
- 🏷️ **Email Tagging** - Organized tracking with Resend tags
- ♿ **Accessible** - Text fallbacks and screen reader friendly

## Email Types

### 1. Sign-in (`sign-in`)
- **Subject**: "Votre code de connexion Kurama"
- **Use case**: User authentication via OTP
- **Template**: Student-focused messaging

### 2. Email Verification (`email-verification`)
- **Subject**: "Vérifiez votre email Kurama"
- **Use case**: Email address verification during registration
- **Template**: Verification-focused messaging

### 3. Password Reset (`forget-password`)
- **Subject**: "Réinitialisation mot de passe Kurama"
- **Use case**: Password reset flow
- **Template**: Security-focused messaging

## Configuration

### Environment Variables

```bash
# Required
RESEND_API_KEY=re_NFz8eZEo_6ViBfnwF24U866kXUtycSaby

# Optional (defaults provided)
RESEND_FROM_EMAIL=noreply@kurama.ci  # Default sender
```

### Wrangler Configuration

Add to `wrangler.jsonc`:

```json
{
  "vars": {
    "RESEND_API_KEY": "re_NFz8eZEo_6ViBfnwF24U866kXUtycSaby",
    "RESEND_FROM_EMAIL": "noreply@kurama.ci"
  }
}
```

## Usage

### Basic Setup

```typescript
import { createSendVerificationOTP } from "@kurama/data-ops/email/resend";

const sendVerificationOTP = createSendVerificationOTP({
  apiKey: env.RESEND_API_KEY,
  fromEmail: env.RESEND_FROM_EMAIL ?? "noreply@kurama.ci",
  fromName: "Kurama",
});

// Use in Better Auth configuration
setAuth({
  // ... other config
  sendVerificationOTP,
});
```

### Direct Email Sending

```typescript
import { createResendClient } from "@kurama/data-ops/email/resend";

const client = createResendClient({
  apiKey: "re_NFz8eZEo_6ViBfnwF24U866kXUtycSaby",
  fromEmail: "noreply@kurama.ci",
  fromName: "Kurama",
});

await client.sendOTP({
  email: "student@example.com",
  otp: "123456",
  type: "sign-in",
});
```

## Testing

### Test Email Sending

```bash
# Test all email types
pnpm run --filter @kurama/data-ops test:email

# Or run directly
tsx packages/data-ops/src/email/test-email.ts
```

### Preview Templates

```bash
# Start React Email dev server
npx react-email dev
```

## Template Design

### Visual Identity
- **Primary Color**: Orange (#f97316) - Kurama brand color
- **Typography**: System fonts for maximum compatibility
- **Layout**: Mobile-first, 480px max width
- **Spacing**: Consistent 8px grid system

### Email Client Compatibility
- ✅ Gmail (Web, Mobile, App)
- ✅ Outlook (Web, Desktop, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Samsung Email
- ✅ Dark mode support

### Security Features
- **No External Images**: All styling is inline
- **Text Fallback**: Full text version for accessibility
- **Security Warnings**: Clear messaging about not sharing codes
- **Expiration Notice**: Prominent 5-minute expiration warning

## Monitoring

### Resend Dashboard
- Email delivery status
- Open/click rates
- Bounce/complaint tracking
- Tag-based analytics

### Email Tags
- `category: auth` - All authentication emails
- `type: sign-in|email-verification|forget-password` - Email type
- `environment: development|production` - Environment tracking

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check RESEND_API_KEY is valid
   - Verify domain is configured in Resend
   - Check Cloudflare Workers logs

2. **Template not rendering**
   - Ensure React Email dependencies are installed
   - Check for JSX compilation errors
   - Verify template imports

3. **Styling issues**
   - All styles are inline for compatibility
   - Test in multiple email clients
   - Check dark mode rendering

### Debug Mode

```typescript
// Enable detailed logging
process.env.DEBUG = "resend:*";
```

## Development

### File Structure

```
src/email/
├── index.ts              # Main exports
├── resend.ts             # Resend client & configuration
├── test-email.ts         # Testing utilities
├── templates/
│   └── otp-email.tsx     # OTP email template
└── README.md             # This file
```

### Adding New Templates

1. Create template in `templates/`
2. Export from `index.ts`
3. Add to Resend client
4. Update tests
5. Document usage

## Production Checklist

- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] SPF/DKIM records set
- [ ] DMARC policy configured
- [ ] Email templates tested
- [ ] Delivery monitoring set up
- [ ] Bounce handling implemented

## Support

For email delivery issues:
- Check Resend dashboard
- Review Cloudflare Workers logs
- Verify DNS configuration
- Contact Resend support if needed

---

**Kurama Email System** - Delivering secure, beautiful emails for Ivorian students. 🇨🇮
