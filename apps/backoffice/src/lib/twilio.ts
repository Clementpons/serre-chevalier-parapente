// Service SMS via Brevo (anciennement Sendinblue)
// Variables d'environnement requises :
//   BREVO_API_KEY=xkeysib-...
//   BREVO_SENDER_NAME=SCPARAPENTE   (max 11 caractères, sans espace ni accent)
//   SMS_SIMULATION=true             (dev — log sans envoyer)

const apiKey = process.env.BREVO_API_KEY?.trim();
const senderName = process.env.BREVO_SENDER_NAME || "Serre Chevalier Parapente";

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
 * Envoie un SMS via l'API Brevo (transactionalSMS).
 * Type "marketing" → Brevo ajoute automatiquement "STOP au XXXXX" (obligatoire en France).
 */
export async function sendSms({
  to,
  body,
}: SendSmsOptions): Promise<TwilioSendResult> {
  const simulate = process.env.SMS_SIMULATION === "true" || !apiKey;

  if (simulate) {
    if (process.env.SMS_SIMULATION === "true") {
      console.info("ℹ️ Mode SIMULATION SMS activé via SMS_SIMULATION=true");
    } else {
      console.warn("⚠️ BREVO_API_KEY manquant — envoi simulé.");
    }
    console.warn("Envoi simulé du SMS vers:", to);
    return {
      success: true,
      messageSid: `simulated_${Math.random().toString(36).substring(7)}`,
      status: "QUEUED",
    };
  }

  const payload = {
    sender: senderName,
    recipient: to,
    content: body,
    type: "marketing",
  };

  try {
    const response = await fetch(
      "https://api.brevo.com/v3/transactionalSMS/sms",
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000), // 15s max par SMS
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `HTTP ${response.status}`;
      console.error(`Erreur Brevo SMS vers ${to}:`, errorMsg);
      return { success: false, error: errorMsg, status: "FAILED" };
    }

    return {
      success: true,
      messageSid: String(data.messageId),
      status: "SENT",
    };
  } catch (error: any) {
    const isTimeout = error.name === "TimeoutError" || error.name === "AbortError";
    console.error(`Erreur d'envoi SMS Brevo vers ${to}:`, isTimeout ? "Timeout (15s)" : error.message);
    return {
      success: false,
      error: isTimeout ? "Timeout : Brevo n'a pas répondu en 15s" : (error.message || "Erreur inconnue Brevo"),
      status: "FAILED",
    };
  }
}
