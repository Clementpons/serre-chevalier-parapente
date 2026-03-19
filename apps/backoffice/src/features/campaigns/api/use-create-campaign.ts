import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateCampaign } from "../schemas";

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaign) => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de la création");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la création");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Campagne SMS créée avec succès");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });
};
