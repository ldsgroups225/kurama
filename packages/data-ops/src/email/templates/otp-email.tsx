import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OTPEmailProps {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
  expiresInMinutes?: number;
}

const typeLabels = {
  "sign-in": {
    title: "Connexion à votre compte",
    description: "Bonjour, voici votre code de vérification pour accéder à votre espace étudiant Kurama.",
    preview: "Votre code de connexion Kurama",
  },
  "email-verification": {
    title: "Vérification de votre email",
    description: "Voici votre code pour vérifier votre adresse email sur Kurama.",
    preview: "Vérifiez votre email Kurama",
  },
  "forget-password": {
    title: "Réinitialisation du mot de passe",
    description: "Voici votre code pour réinitialiser votre mot de passe Kurama.",
    preview: "Réinitialisation mot de passe Kurama",
  },
};

export function OTPEmail({
  otp = "123456",
  type = "sign-in",
  expiresInMinutes = 5,
}: OTPEmailProps) {
  const { title, description, preview } = typeLabels[type];

  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview} : {otp}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
        }}
      >
        <Container
          style={{
            padding: "20px 0",
            textAlign: "center" as const,
          }}
        >
          {/* Main Card */}
          <Section
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Header with Logo */}
            <Section style={{ padding: "32px 32px 0 32px", textAlign: "center" as const }}>
              <Text
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#f97316",
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Kurama
              </Text>
            </Section>

            {/* Content */}
            <Section style={{ padding: "32px" }}>
              <Heading
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "20px",
                  fontWeight: "600",
                  textAlign: "center" as const,
                  color: "#111827",
                }}
              >
                {title}
              </Heading>
              <Text
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "16px",
                  lineHeight: "24px",
                  textAlign: "center" as const,
                  color: "#4b5563",
                }}
              >
                {description}
              </Text>

              {/* OTP Code Box */}
              <Section
                style={{
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center" as const,
                  marginBottom: "24px",
                }}
              >
                <Text
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "32px",
                    fontWeight: "700",
                    letterSpacing: "8px",
                    color: "#ea580c",
                    margin: 0,
                    display: "block",
                  }}
                >
                  {otp}
                </Text>
              </Section>

              <Text
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "20px",
                  textAlign: "center" as const,
                  color: "#6b7280",
                }}
              >
                Ce code expirera dans <strong>{expiresInMinutes} minutes</strong>.
              </Text>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: "#f9fafb",
                padding: "24px",
                textAlign: "center" as const,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <Text
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                © {new Date().getFullYear()} Kurama - Abidjan, Côte d'Ivoire
              </Text>
            </Section>
          </Section>

          {/* External Link */}
          <Section
            style={{
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <Section style={{ padding: "24px", textAlign: "center" as const }}>
              <Link
                href="https://kurama.ci"
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  textDecoration: "none",
                }}
              >
                Visiter le site web
              </Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OTPEmail;
