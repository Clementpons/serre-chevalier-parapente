import { z } from "zod";

const CartItemTypeEnum = z.enum(["STAGE", "BAPTEME", "GIFT_VOUCHER"]);

export const CreatePromoCodeSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Le code est requis" })
    .max(50)
    .toUpperCase(),
  label: z.string().optional(),
  recipientNote: z.string().optional(),
  discountType: z.enum(["FIXED", "PERCENTAGE"]),
  discountValue: z
    .number()
    .min(0.01, { message: "La valeur de réduction doit être > 0" }),
  maxDiscountAmount: z.number().optional(), // Plafond pour les codes PERCENTAGE
  minCartAmount: z.number().optional(),
  maxUses: z.number().int().min(1).optional(),
  expiryDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  // [] = applicable à tous les produits ; sinon restreint aux types listés
  applicableProductTypes: z.array(CartItemTypeEnum).default([]),
});

export const UpdatePromoCodeSchema = z.object({
  label: z.string().optional(),
  recipientNote: z.string().optional(),
  discountType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
  discountValue: z.number().min(0.01).optional(),
  maxDiscountAmount: z.number().optional(),
  minCartAmount: z.number().optional(),
  maxUses: z.number().int().min(1).optional(),
  expiryDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
  applicableProductTypes: z.array(CartItemTypeEnum).optional(),
});

// Détail d'un item de panier pour le calcul de réduction par type
const CartItemBreakdownSchema = z.object({
  type: CartItemTypeEnum,
  amount: z.number().min(0),
  isGiftVoucherCovered: z.boolean().optional(),
});

// Schema pour valider un code depuis le front (checkout)
export const ValidatePromoCodeSchema = z.object({
  code: z.string().min(1, { message: "Le code est requis" }),
  // cartTotal = montant réellement encaissé (acomptes pour stages)
  cartTotal: z.number().min(0, { message: "Le montant du panier est requis" }),
  // cartSubtotal = prix plein des articles (pour vérifier minCartAmount)
  cartSubtotal: z.number().min(0).optional(),
  // Détail par item pour les codes restreints à certains types de produits
  cartItems: z.array(CartItemBreakdownSchema).optional(),
});

export type CreatePromoCode = z.infer<typeof CreatePromoCodeSchema>;
export type UpdatePromoCode = z.infer<typeof UpdatePromoCodeSchema>;
export type ValidatePromoCode = z.infer<typeof ValidatePromoCodeSchema>;
