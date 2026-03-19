import { z } from "zod";
import { StageType } from "@prisma/client";

export const CreateStageSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La date de début doit être une date valide.",
  }),
  duration: z.number().int().min(1, {
    message: "La durée doit être supérieure à 0.",
  }),
  places: z.number().int().min(1, {
    message: "Le nombre de places doit être supérieur à 0.",
  }),
  moniteurIds: z.array(z.string().min(1)).min(1, {
    message: "Au moins un moniteur doit être sélectionné.",
  }),
  price: z.number().min(0, {
    message: "Le prix doit être supérieur ou égal à 0.",
  }),
  acomptePrice: z.number().min(0, {
    message: "Le montant de l'acompte doit être supérieur ou égal à 0.",
  }),
  type: z.nativeEnum(StageType, {
    message: "Le type de stage doit être valide.",
  }),
});

export const UpdateStageSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La date de début doit être une date valide.",
  }),
  duration: z.number().int().min(1, {
    message: "La durée doit être supérieure à 0.",
  }),
  places: z.number().int().min(1, {
    message: "Le nombre de places doit être supérieur à 0.",
  }),
  moniteurIds: z.array(z.string().min(1)).min(1, {
    message: "Au moins un moniteur doit être sélectionné.",
  }),
  price: z.number().min(0, {
    message: "Le prix doit être supérieur ou égal à 0.",
  }),
  acomptePrice: z.number().min(0, {
    message: "Le montant de l'acompte doit être supérieur ou égal à 0.",
  }),
  type: z.nativeEnum(StageType, {
    message: "Le type de stage doit être valide.",
  }),
});

export const ApplyStagePromotionSchema = z.object({
  newPrice: z.number().min(0, { message: "Le prix promotionnel doit être >= 0." }),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Date d'expiration invalide." })
    .optional(),
  reason: z.string().optional(),
});

export const DeleteStageSchema = z.object({
  id: z.string().min(1, {
    message: "L'identifiant du stage est requis.",
  }),
});
