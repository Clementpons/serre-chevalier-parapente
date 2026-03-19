import { z } from "zod";

export const TopBarSchema = z.object({
  isActive: z.boolean(),
  title: z.string().min(1, "Le titre est requis"),
  secondaryText: z.string().optional().default(""),
  ctaTitle: z.string().optional().default(""),
  ctaLink: z.string().optional().default(""),
  ctaIsFull: z.boolean().default(false),
  ctaIsExternal: z.boolean().default(false),
});
