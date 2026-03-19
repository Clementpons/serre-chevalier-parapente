import * as z from "zod";

export const reservationSchema = z.object({
  stageType: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Type de stage obligatoire.",
    }),
  saison: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Saison obligatoire.",
    }),
  idStage: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Date de stage obligatoire.",
    }),
  firstname: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Prénom obligatoire.",
    }),
  lastname: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Nom obligatoire.",
    }),
  email: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .email({
      message: "Adresse email obligatoire.",
    }),
  phoneIndex: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Phone Index obligatoire.",
    }),
  phone: z
    .string({
      invalid_type_error: "Type invalide (String attendu).",
    })
    .min(1, {
      message: "Numéro de téléphone obligatoire.",
    }),
  poids: z
    .number({
      invalid_type_error: "Type invalide (Number attendu).",
    })
    .positive({
      message: "Le poids doit être un nombre positif.",
    }),
  taille: z
    .number({
      invalid_type_error: "Type invalide (Number attendu).",
    })
    .positive({
      message: "La taille doit être un nombre positif.",
    }),
  acceptCGU: z.boolean({
    invalid_type_error: "Type invalide (Boolean attendu).",
  }),
});

