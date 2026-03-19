import { z } from "zod";

export const ChangeUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "MONITEUR", "CUSTOMER"]),
});

