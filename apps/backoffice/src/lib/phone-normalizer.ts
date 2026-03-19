import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export interface PhoneNormalizationResult {
  isValid: boolean;
  formattedNumber: string | null;
  error?: string;
}

/**
 * Normalise un numéro de téléphone pour l'envoi de SMS via Twilio.
 * Prend un numéro (français par défaut) et le convertit au format E.164 (ex: +33612345678).
 * Vérifie également qu'il s'agit bien d'un numéro de mobile (commence par 06/07 en France).
 */
export function normalizeMobileNumber(
  phoneNumber: string,
  defaultRegion: string = "FR",
): PhoneNormalizationResult {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return { isValid: false, formattedNumber: null, error: "Numéro vide" };
  }

  try {
    // 1. Parsing du numéro (ajoute +33 si c'est un 06... en FR)
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, defaultRegion);

    // 2. Vérification de la validité générale
    if (!phoneUtil.isValidNumber(number)) {
      return {
        isValid: false,
        formattedNumber: null,
        error: "Numéro invalide",
      };
    }

    // 3. (Optionnel mais recommandé pour les SMS) Vérification que c'est un numéro mobile
    // Note: libphonenumber a `getNumberType` mais c'est lourd. On fait un check simple pour la France.
    const e164 = phoneUtil.format(number, PhoneNumberFormat.E164);

    // Si c'est un numéro français (+33), on force le 06 ou 07
    if (e164.startsWith("+33")) {
      const isMobile = e164.startsWith("+336") || e164.startsWith("+337");
      if (!isMobile) {
        return {
          isValid: false,
          formattedNumber: e164,
          error:
            "Numéro français mais pas un mobile (06/07 requis pour les SMS)",
        };
      }
    }

    // Tout est OK
    return {
      isValid: true,
      formattedNumber: e164,
    };
  } catch (error) {
    // Erreur de parsing (caractères invalides etc.)
    return {
      isValid: false,
      formattedNumber: null,
      error: error instanceof Error ? error.message : "Erreur de format",
    };
  }
}
