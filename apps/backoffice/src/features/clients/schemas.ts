import { z } from "zod";

export const AddClientSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  email: z
    .string()
    .email({ message: "L'email doit être valide" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(5, { message: "Le numéro de téléphone est requis" }),
  address: z.string().min(1, { message: "L'adresse est requise" }),
  postalCode: z.string().min(1, { message: "Le code postal est requis" }),
  city: z.string().min(1, { message: "La ville est requise" }),
  country: z.string().min(1, { message: "Le pays est requis" }),
});

export const UpdateClientSchema = AddClientSchema.partial();
