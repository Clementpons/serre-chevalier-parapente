import { z } from "zod";
import { VoucherProductType, StageBookingType, BaptemeCategory } from "@prisma/client";

// Schéma pour créer un bon cadeau (admin ou via achat)
export const CreateGiftVoucherSchema = z.object({
  productType: z.nativeEnum(VoucherProductType, {
    message: "Type de produit invalide (STAGE ou BAPTEME)",
  }),
  stageCategory: z.nativeEnum(StageBookingType).optional(),
  baptemeCategory: z.nativeEnum(BaptemeCategory).optional(),
  recipientName: z.string().min(1, { message: "Nom du bénéficiaire requis" }),
  recipientEmail: z.string().email({ message: "Email du bénéficiaire invalide" }),
  purchasePrice: z.number().positive({ message: "Prix d'achat doit être positif" }).optional(),
}).refine(
  (data) => {
    if (data.productType === 'STAGE') return !!data.stageCategory;
    if (data.productType === 'BAPTEME') return !!data.baptemeCategory;
    return false;
  },
  { 
    message: "La catégorie correspondant au type de produit est requise",
    path: ["stageCategory", "baptemeCategory"]
  }
);

// Schéma pour valider un code de bon cadeau
export const ValidateVoucherSchema = z.object({
  code: z.string().min(1, { message: "Code du bon cadeau requis" }),
  productType: z.nativeEnum(VoucherProductType, {
    message: "Type de produit invalide",
  }),
  category: z.string().min(1, { message: "Catégorie requise" }), // StageBookingType ou BaptemeCategory
});

// Schéma pour réserver un bon cadeau (ajout au panier)
export const ReserveVoucherSchema = z.object({
  code: z.string().min(1, { message: "Code du bon cadeau requis" }),
  sessionId: z.string().min(1, { message: "Session ID requis" }),
});

// Schéma pour libérer un bon cadeau (suppression du panier)
export const ReleaseVoucherSchema = z.object({
  code: z.string().min(1, { message: "Code du bon cadeau requis" }),
  sessionId: z.string().min(1, { message: "Session ID requis" }),
});

// Schéma pour obtenir le prix d'un bon cadeau
export const GetVoucherPriceSchema = z.object({
  productType: z.nativeEnum(VoucherProductType),
  category: z.string().min(1), // StageBookingType ou BaptemeCategory
});

// Schéma pour mettre à jour un bon cadeau (admin)
export const UpdateGiftVoucherSchema = z.object({
  recipientName: z.string().min(1).optional(),
  recipientEmail: z.string().email().optional(),
  isUsed: z.boolean().optional(),
  expiryDate: z.coerce.date().optional(),
});

// Schéma pour la recherche rapide d'un bon cadeau (par code uniquement, sans type/catégorie)
export const LookupVoucherSchema = z.object({
  code: z.string().min(1, { message: "Code du bon cadeau requis" }),
});

// Types TypeScript exportés
export type LookupVoucher = z.infer<typeof LookupVoucherSchema>;
export type CreateGiftVoucher = z.infer<typeof CreateGiftVoucherSchema>;
export type ValidateVoucher = z.infer<typeof ValidateVoucherSchema>;
export type ReserveVoucher = z.infer<typeof ReserveVoucherSchema>;
export type ReleaseVoucher = z.infer<typeof ReleaseVoucherSchema>;
export type GetVoucherPrice = z.infer<typeof GetVoucherPriceSchema>;
export type UpdateGiftVoucher = z.infer<typeof UpdateGiftVoucherSchema>;