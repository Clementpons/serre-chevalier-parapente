import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  userName = "Utilisateur",
  resetUrl = "http://localhost:3001/reset-password?token=xxx",
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Réinitialisation de votre mot de passe - Serre Chevalier Parapente</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerTitle}>Serre Chevalier Parapente</Heading>
          <Text style={headerSubtitle}>Backoffice</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Réinitialisation du mot de passe</Heading>
          <Text style={text}>Bonjour {userName},</Text>
          <Text style={text}>
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez
            sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </Text>
          <Text style={text}>
            Ce lien est valable pendant <strong>1 heure</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email.
            Votre mot de passe ne sera pas modifié.
          </Text>
          <Text style={footer}>
            Serre Chevalier Parapente — Backoffice
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const header = {
  backgroundColor: "#1e293b",
  borderRadius: "8px 8px 0 0",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const headerSubtitle = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: "4px 0 0",
};

const content = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 8px 8px",
  padding: "32px",
  border: "1px solid #e2e8f0",
  borderTop: "none",
};

const h1 = {
  color: "#1e293b",
  fontSize: "22px",
  fontWeight: "600",
  margin: "0 0 24px",
};

const text = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};
