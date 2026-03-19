import twilio from "twilio";

// Récupération des clés depuis les variables d'environnement
// L'idéal est de les rajouter dans ton fichier .env:
// TWILIO_ACCOUNT_SID=...
// TWILIO_AUTH_TOKEN=...
// TWILIO_PHONE_NUMBER=...
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

type SendSmsOptions = {
  to: string; // Numéro formaté E.164 (ex: +33612345678)
  body: string; // Message complet avec personnalisation ("Bonjour M. Dupont...")
};

export interface TwilioSendResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  status?: string;
}

/**
 * Service pour envoyer un SMS via Twilio.
 * Gère proprement les erreurs de configuration locale pour ne pas crash.
 */
export async function sendSms({
  to,
  body,
}: SendSmsOptions): Promise<TwilioSendResult> {
  const simulate =
    process.env.TWILIO_SIMULATION === "true" ||
    !accountSid ||
    !authToken ||
    !fromNumber;

  if (simulate) {
    if (process.env.TWILIO_SIMULATION === "true") {
      console.info("ℹ️ Mode SIMULATION SMS activé via TWILIO_SIMULATION=true");
    } else {
      console.warn(
        "⚠️ TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ou TWILIO_PHONE_NUMBER manquant.",
      );
    }
    console.warn("Envoi simulé du SMS vers:", to);
    // En environnement de dev (sans clés), on peut simuler un succès pour tester la cascade.
    return {
      success: true,
      messageSid: `simulated_${Math.random().toString(36).substring(7)}`,
      status: "QUEUED",
    };
  }

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
    };
  } catch (error: any) {
    console.error(`Erreur d'envoi SMS Twilio vers ${to}:`, error);
    return {
      success: false,
      error: error.message || "Erreur inconnue Twilio",
      status: "FAILED",
    };
  }
}
