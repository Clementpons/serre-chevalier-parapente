import { z } from "zod";

// Fonction pour calculer l'âge à partir de la date de naissance
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export const AddStagiaireSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  email: z
    .string()
    .email({ message: "L'email doit être valide" })
    .min(1, { message: "L'email est requis" }),
  phone: z.string().min(5, { message: "Le numéro de téléphone est requis" }),
  birthDate: z.coerce
    .date({ required_error: "La date de naissance est requise" })
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age >= 0 && age <= 120;
      },
      {
        message: "L'âge doit être compris entre 0 et 120 ans",
      },
    )
    .refine(
      (date) => {
        return date <= new Date();
      },
      {
        message: "La date de naissance ne peut pas être dans le futur",
      },
    ),
  height: z.coerce
    .number()
    .min(1, { message: "La taille doit être supérieure ou égale à 1" }),
  weight: z.coerce
    .number()
    .min(1, { message: "Le poids doit être supérieur ou égal à 1" }),
});

export const UpdateStagiaireSchema = AddStagiaireSchema.partial();
