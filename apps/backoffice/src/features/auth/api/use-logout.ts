import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message ?? "Déconnexion impossible");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Déconnexion réussie");
      queryClient.clear();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
