import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useCurrent = () => {
  return useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const session = await authClient.getSession();
      if (!session?.data) return null;
      return session.data.user;
    },
  });
};
