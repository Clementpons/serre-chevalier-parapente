import { useGetUsersByRole } from "./use-get-users";
import { Role } from "@prisma/client";

export const useGetMoniteurs = () => {
  return useGetUsersByRole(Role.MONITEUR);
};