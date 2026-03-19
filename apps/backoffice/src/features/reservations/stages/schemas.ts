import { z } from "zod";
import { StageBookingType, StageType } from "@prisma/client";
import { id } from "date-fns/locale";

export const CreateByAdminReservationStageSchema = z.object({
  customerId: z.string().min(1, "Le client est requis"),
  stageId: z.string().min(1, "La semaine est requise"),
  type: z.nativeEnum(StageBookingType, {
    errorMap: () => ({ message: "Le type de stage est requis" }),
  }),
});
