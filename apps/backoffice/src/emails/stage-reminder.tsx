import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface StageReminderEmailProps {
  firstName: string;
  lastName: string;
  stageType: string;
  startDate: string;
  daysUntilStart: number; // 1 ou 7
  bookingShortCode?: string | null;
  remainingAmount?: number;
}

const MAPS_URL = "https://maps.app.goo.gl/tHUd2Gt8WYHXoMuP7";
const LOGO_URL = "https://www.serre-chevalier-parapente.fr/_next/image?url=%2Flogo%2Flogo-light-nobg.webp&w=96&q=75";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const stageTypeLabel = (type: string) => {
  switch (type) {
    case "INITIATION":
      return "Stage Initiation";
    case "PROGRESSION":
      return "Stage Progression";
    case "AUTONOMIE":
      return "Stage Autonomie";
    default:
      return `Stage ${type}`;
  }
};

export const StageReminderEmail = ({
  firstName = "Jean",
  lastName = "Dupont",
  stageType = "INITIATION",
  startDate = new Date().toISOString(),
  daysUntilStart = 7,
  bookingShortCode,
  remainingAmount,
}: StageReminderEmailProps) => {
  const isTomorrow = daysUntilStart === 1;
  const previewText = isTomorrow
    ? `Votre stage commence demain — rendez-vous à 8h à Briançon !`
    : `Votre stage commence dans 7 jours — voici toutes les infos !`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Img
              alt="Serre Chevalier Parapente"
              style={{ width: "120px", height: "120px", margin: "0 auto" }}
              src={LOGO_URL}
            />
            <Heading style={h1}>
              {isTomorrow ? "C'est demain !" : "Dans 7 jours !"}
            </Heading>
            <Text style={subtitle}>
              {isTomorrow
                ? "Préparez vos affaires, votre stage commence demain"
                : "Votre stage approche — voici tout ce qu'il faut savoir"}
            </Text>
          </Section>

          {/* Intro */}
          <Section style={section}>
            <Text style={bodyText}>
              Bonjour <strong>{firstName}</strong>,
            </Text>
            <Text style={bodyText}>
              {isTomorrow ? (
                <>Votre <strong>{stageTypeLabel(stageType)}</strong> commence <strong>demain, le {formatDate(startDate)}</strong>. Nous sommes impatients de vous accueillir !</>
              ) : (
                <>Votre <strong>{stageTypeLabel(stageType)}</strong> commence dans <strong>7 jours, le {formatDate(startDate)}</strong>. Voici un rappel de toutes les informations pratiques.</>
              )}
            </Text>

            {bookingShortCode && (
              <div style={refBox}>
                <Text style={refLabel}>Référence de réservation</Text>
                <Text style={refCode}>{bookingShortCode}</Text>
              </div>
            )}
          </Section>

          <Hr style={hr} />

          {/* Rendez-vous */}
          <Section style={section}>
            <Heading as="h2" style={h2}>📍 Rendez-vous</Heading>

            <div style={infoCard}>
              <Text style={infoTitle}>Lieu & horaire</Text>
              <Text style={infoText}>
                <strong>Dimanche à 8h00</strong> au local de l&apos;école :{"\n"}
                7 Av. René Froger, 05100 Briançon
              </Text>
              <Button href={MAPS_URL} style={mapsButton}>
                Ouvrir dans Google Maps
              </Button>
            </div>

            <div style={infoCard}>
              <Text style={infoTitle}>Programme de la journée</Text>
              <Text style={infoText}>
                🪂 <strong>8h00 – 12h00</strong> — Pratique sur le terrain{"\n"}
                🎓 <strong>14h00 – 16h00</strong> — Séance théorique
              </Text>
              <Text style={infoNote}>
                Les horaires et activités peuvent varier selon les conditions météo du moment.
              </Text>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Ce qu'il faut apporter */}
          <Section style={section}>
            <Heading as="h2" style={h2}>🎒 Ce qu&apos;il faut apporter</Heading>
            <div style={infoCard}>
              <Text style={infoText}>
                💧 De l&apos;eau{"\n"}
                🕶️ Des lunettes de soleil{"\n"}
                👟 Des chaussures pour courir sur terrain varié{"\n"}
                🥪 Un petit casse-croûte{"\n"}
                😄 Votre bonne humeur !
              </Text>
            </div>
          </Section>

          {/* Solde restant */}
          {remainingAmount && remainingAmount > 0 ? (
            <>
              <Hr style={hr} />
              <Section style={section}>
                <Heading as="h2" style={h2}>💳 Solde à régler</Heading>
                <div style={warningCard}>
                  <Text style={warningText}>
                    Un solde de <strong>{remainingAmount.toFixed(2)} €</strong> reste à régler directement auprès de votre moniteur le premier jour du stage.
                  </Text>
                </div>
              </Section>
            </>
          ) : null}

          <Hr style={hr} />

          {/* Contact */}
          <Section style={section}>
            <Heading as="h2" style={h2}>📞 Une question ?</Heading>
            <Text style={bodyText}>
              N&apos;hésitez pas à nous contacter si vous avez besoin d&apos;informations complémentaires.
            </Text>
            <Text style={contactItem}><strong>Téléphone :</strong> 06 45 91 35 95</Text>
            <Text style={contactItem}><strong>Email :</strong> clementpons5@gmail.com</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Bientôt dans les airs !</Text>
            <Text style={footerText}>L&apos;équipe de Serre Chevalier Parapente</Text>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} Serre Chevalier Parapente — Tous droits réservés
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default StageReminderEmail;

// Styles
const main = {
  backgroundColor: "#f0f4ff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "32px 0",
  backgroundColor: "#1d4ed8",
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "16px 0 8px",
};

const subtitle = {
  color: "#bfdbfe",
  fontSize: "16px",
  margin: "0",
};

const section = {
  padding: "24px 32px",
};

const h2 = {
  color: "#1e3a8a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const bodyText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const refBox = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  padding: "12px 16px",
  marginTop: "16px",
  display: "inline-block",
};

const refLabel = {
  color: "#1e40af",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const refCode = {
  color: "#1e3a8a",
  fontSize: "20px",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: "0",
};

const infoCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "12px",
};

const infoTitle = {
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 6px",
};

const infoText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0 0 10px",
  whiteSpace: "pre-line" as const,
};

const infoNote = {
  color: "#6b7280",
  fontSize: "13px",
  fontStyle: "italic",
  margin: "0",
};

const mapsButton = {
  backgroundColor: "#1d4ed8",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "10px 20px",
  display: "inline-block",
  marginTop: "4px",
};

const warningCard = {
  backgroundColor: "#fef9c3",
  border: "1px solid #fde047",
  borderRadius: "8px",
  padding: "14px 16px",
};

const warningText = {
  color: "#713f12",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const contactItem = {
  color: "#374151",
  fontSize: "15px",
  margin: "0 0 8px",
};

const footer = {
  textAlign: "center" as const,
  padding: "24px 32px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
};

const footerText = {
  color: "#374151",
  fontSize: "15px",
  fontWeight: "500",
  margin: "4px 0",
};

const footerSmall = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "12px 0 0",
};
