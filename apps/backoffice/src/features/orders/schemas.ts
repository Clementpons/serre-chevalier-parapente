import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerEmail: z.string().email("Email invalide"),
  customerData: z
    .object({
      firstName: z.string().min(1, "Prénom requis"),
      lastName: z.string().min(1, "Nom requis"),
      phone: z.string().min(1, "Téléphone requis"),
      address: z.string().min(1, "Adresse requise"),
      postalCode: z.string().min(1, "Code postal requis"),
      city: z.string().min(1, "Ville requise"),
      country: z.string().min(1, "Pays requis"),
    })
    .optional(),
  promoCodeId: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"]),
});

export const CancelOrderSchema = z.object({
  orderId: z.string(),
  reason: z.string().optional(),
});

export const CreatePaymentIntentSchema = z.object({
  orderId: z.string(),
});

export const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  orderId: z.string(),
});
