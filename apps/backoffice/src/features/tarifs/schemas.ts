import { z } from "zod";
import { BaptemeCategory, StageType } from "@prisma/client";

export const UpdateTarifSchema = z.object({
  category: z.nativeEnum(BaptemeCategory),
  price: z.number().positive("Le prix doit être positif"),
});

export type UpdateTarifInput = z.infer<typeof UpdateTarifSchema>;

export const UpdateVideoOptionPriceSchema = z.object({
  price: z.number().positive("Le prix doit être positif"),
});

export type UpdateVideoOptionPriceInput = z.infer<typeof UpdateVideoOptionPriceSchema>;

export const UpdateStageBasePriceSchema = z.object({
  stageType: z.nativeEnum(StageType),
  price: z.number().positive("Le prix doit être positif"),
});

export type UpdateStageBasePriceInput = z.infer<typeof UpdateStageBasePriceSchema>;

export const UpdateBaptemeDepositPriceSchema = z.object({
  price: z.number().positive("Le prix doit être positif"),
});

export type UpdateBaptemeDepositPriceInput = z.infer<typeof UpdateBaptemeDepositPriceSchema>;