import { z } from "zod";

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  audienceIds: z
    .array(z.string())
    .min(1, "Au moins une audience ciblée est requise"),
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1600, "Le message est trop long"),
  scheduledAt: z.coerce.date().optional(), // Si l'envoi est différé

  generatePromoCode: z.boolean().default(false),
  promoDiscountType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
  promoDiscountValue: z.number().min(0).optional(),
  promoMaxDiscountAmount: z.number().optional(), // Plafond pour PERCENTAGE
  promoMinCartAmount: z.number().optional(), // Montant min du panier
  promoMaxUses: z.number().min(1).optional(),
  promoExpiryDate: z.coerce.date().optional(),
});

export const UpdateCampaignSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  audienceIds: z.array(z.string()).min(1).optional(),
  content: z.string().min(1).max(1600).optional(),
  scheduledAt: z.coerce.date().optional(),

  generatePromoCode: z.boolean().optional(),
  promoDiscountType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
  promoDiscountValue: z.number().min(0).optional(),
  promoMaxDiscountAmount: z.number().optional(),
  promoMinCartAmount: z.number().optional(),
  promoMaxUses: z.number().min(1).optional(),
  promoExpiryDate: z.coerce.date().optional(),
});

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;
