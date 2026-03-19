import { z } from "zod";

const AudienceRuleSchema = z.object({
  ruleType: z.enum([
    "CLIENT_RESERVED_STAGE",
    "CLIENT_RESERVED_BAPTEME",
    "STAGIAIRE_STAGE",
    "STAGIAIRE_BAPTEME",
    "PURCHASED_GIFT_VOUCHER",
    "ORDER_ABOVE_AMOUNT",
  ]),
  stageType: z.enum(["INITIATION", "PROGRESSION", "AUTONOMIE"]).optional(),
  baptemeCategory: z
    .enum(["AVENTURE", "DUREE", "LONGUE_DUREE", "ENFANT", "HIVER"])
    .optional(),
  minOrderAmount: z.number().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const AudienceContactSchema = z.object({
  phone: z.string().min(1, "Téléphone requis"),
  name: z.string().optional(),
});

export const CreateAudienceSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    rules: z.array(AudienceRuleSchema).default([]),
    contacts: z.array(AudienceContactSchema).default([]),
  })
  .refine((data) => data.rules.length > 0 || data.contacts.length > 0, {
    message: "Au moins une règle ou un contact est requis",
    path: ["root"],
  });

export const UpdateAudienceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  rules: z.array(AudienceRuleSchema).optional(),
  contacts: z.array(AudienceContactSchema).optional(),
});

export type CreateAudience = z.infer<typeof CreateAudienceSchema>;
export type UpdateAudience = z.infer<typeof UpdateAudienceSchema>;
export type AudienceRule = z.infer<typeof AudienceRuleSchema>;
export type AudienceContact = z.infer<typeof AudienceContactSchema>;
