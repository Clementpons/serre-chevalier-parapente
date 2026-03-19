import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
  Img,
  Button,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface GiftVoucherPurchaseEmailProps {
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail?: string; // Optionnel si pas de notification
  notifyRecipient: boolean;
  personalMessage?: string;
  voucherCode: string;
  voucherType: string; // "Stage INITIATION", "Baptême AVENTURE", etc.
  expiryDate: string;
  purchaseDate: string;
  orderNumber: string;
}

export const GiftVoucherPurchaseEmail = ({
  buyerName = 'Jean Dupont',
  buyerEmail = 'jean@example.com',
  recipientName = 'Marie Dupont',
  recipientEmail,
  notifyRecipient = false,
  personalMessage,
  voucherCode = 'GVSCP-ABC12345-XYZ9',
  voucherType = 'Baptême Aventure',
  expiryDate = '2026-01-15',
  purchaseDate = new Date().toISOString(),
  orderNumber = 'CMD-2024-001',
}: GiftVoucherPurchaseEmailProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Html>
      <Head />
      <Preview>
        {notifyRecipient
          ? `🎁 Bon cadeau de ${buyerName} !`
          : `Votre bon cadeau pour ${recipientName} est prêt !`
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              alt="Photographie de Serre Chevalier Parapente"
              style={{ width: '200px', height: '200px', margin: '0 auto' }}
              src="https://serreche-parapente-backoffice.vercel.app/favicon/android-chrome-512x512.png"
            />
            <Heading style={h1}>
              {notifyRecipient ? `🎁 Bon cadeau de ${buyerName} !` : `🎁 Votre bon cadeau est prêt !`}
            </Heading>
            <Text style={subtitle}>
              {notifyRecipient
                ? `${buyerName} vous offre une expérience inoubliable`
                : `Voici votre bon cadeau pour ${recipientName}`
              }
            </Text>
          </Section>

          {/* Message personnalisé (seulement si notification activée) */}
          {notifyRecipient && personalMessage && (
            <Section style={messageSection}>
              <Heading as="h3" style={h3}>Message personnel</Heading>
              <div style={messageBox}>
                <Text style={messageText}>&apos;{personalMessage}&apos;</Text>
                <Text style={messageAuthor}>- {buyerName}</Text>
              </div>
            </Section>
          )}

          {/* Détails du bon cadeau */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Votre bon cadeau</Heading>

            <div style={voucherCard}>
              <div style={voucherHeader}>
                <Text style={voucherTitle}>{voucherType}</Text>
                <Text style={voucherCodeStyle}>{voucherCode}</Text>
              </div>

              <Hr style={hr} />

              <Row>
                <Column>
                  <Text style={label}>Valable pour</Text>
                  <Text style={value}>{voucherType}</Text>
                </Column>
                <Column>
                  <Text style={label}>Expire le</Text>
                  <Text style={value}>{formatDate(expiryDate)}</Text>
                </Column>
              </Row>

              <Row>
                <Column>
                  <Text style={label}>Commande</Text>
                  <Text style={value}>{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={label}>Acheté le</Text>
                  <Text style={value}>{formatDate(purchaseDate)}</Text>
                </Column>
              </Row>
            </div>
          </Section>

          {/* Instructions d'utilisation */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Comment utiliser votre bon cadeau</Heading>

            <div style={instructionsBox}>
              <div style={stepItem}>
                <Text style={stepIcon}>1️⃣</Text>
                <div>
                  <Text style={stepTitle}>Rendez-vous sur notre site</Text>
                  <Text style={stepDesc}>
                    Allez sur <Link href="https://serre-chevalier-parapente.fr" style={link}>serre-chevalier-parapente.fr</Link>
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <Text style={stepIcon}>2️⃣</Text>
                <div>
                  <Text style={stepTitle}>Choisissez votre activité</Text>
                  <Text style={stepDesc}>
                    Sélectionnez {voucherType.toLowerCase()} dans nos offres
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <Text style={stepIcon}>3️⃣</Text>
                <div>
                  <Text style={stepTitle}>Saisissez votre code</Text>
                  <Text style={stepDesc}>
                    Entrez le code <strong>{voucherCode}</strong> lors de la réservation
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <Text style={stepIcon}>4️⃣</Text>
                <div>
                  <Text style={stepTitle}>Profitez de votre expérience</Text>
                  <Text style={stepDesc}>
                    Votre activité sera gratuite grâce à ce bon cadeau
                  </Text>
                </div>
              </div>
            </div>
          </Section>

          {/* Informations importantes */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Informations importantes</Heading>

            <div style={infoBox}>
              <div style={infoItem}>
                <Text style={infoIcon}>⏰</Text>
                <div>
                  <Text style={infoTitle}>Validité</Text>
                  <Text style={infoDesc}>
                    Ce bon cadeau est valable jusqu&apos;au {formatDate(expiryDate)}
                  </Text>
                </div>
              </div>

              <div style={infoItem}>
                <Text style={infoIcon}>🎯</Text>
                <div>
                  <Text style={infoTitle}>Utilisation unique</Text>
                  <Text style={infoDesc}>
                    Ce code ne peut être utilisé qu&apos;une seule fois pour une réservation
                  </Text>
                </div>
              </div>

              <div style={infoItem}>
                <Text style={infoIcon}>📅</Text>
                <div>
                  <Text style={infoTitle}>Réservation requise</Text>
                  <Text style={infoDesc}>
                    Pensez à réserver votre créneau à l&apos;avance
                  </Text>
                </div>
              </div>
            </div>
          </Section>

          {/* Bouton de réservation */}
          <Section style={ctaSection}>
            <Button href="https://serre-chevalier-parapente.fr" style={button}>
              📅 Réserver mon activité
            </Button>
          </Section>

          {/* Contact */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Besoin d&apos;aide ?</Heading>
            <Row>
              <Column>
                <Text style={label}>Téléphone</Text>
                <Text style={contactLink}>06 45 91 35 95</Text>
              </Column>
              <Column>
                <Text style={label}>Email</Text>
                <Text style={contactLink}>clementpons5@gmail.com</Text>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Merci d&apos;avoir choisi Serre Chevalier Parapente !
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Serre Chevalier Parapente - Tous droits réservés
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default GiftVoucherPurchaseEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const h1 = {
  color: '#15803d',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
};

const subtitle = {
  color: '#4b5563',
  fontSize: '16px',
  margin: '0',
};

const section = {
  padding: '24px 32px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 8px',
};

const messageSection = {
  padding: '24px 32px',
  backgroundColor: '#f0f9ff',
};

const messageBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e7ff',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
};

const messageText = {
  color: '#1e293b',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '0 0 8px',
};

const messageAuthor = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right' as const,
};

const voucherCard = {
  border: '2px solid #0891b2',
  borderRadius: '12px',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  margin: '16px 0',
};

const voucherHeader = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const voucherTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0891b2',
  margin: '0 0 8px',
};

const voucherCodeStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  display: 'inline-block',
  margin: '0',
};

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 4px',
};

const value = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 12px',
};

const instructionsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
};

const stepItem = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
  alignItems: 'flex-start',
};

const stepIcon = {
  fontSize: '20px',
  margin: '0',
  minWidth: '24px',
};

const stepTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 4px',
};

const stepDesc = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde047',
  borderRadius: '8px',
  padding: '16px',
};

const infoItem = {
  display: 'flex',
  gap: '12px',
  marginBottom: '12px',
  alignItems: 'flex-start',
};

const infoIcon = {
  fontSize: '18px',
  margin: '0',
  minWidth: '20px',
};

const infoTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 2px',
};

const infoDesc = {
  fontSize: '13px',
  color: '#a16207',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '24px 32px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  cursor: 'pointer',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const contactLink = {
  color: '#2563eb',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '32px',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '4px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};