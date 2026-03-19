import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campaigns/${id}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de l'envoi");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de l'envoi");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Envoi de la campagne SMS lancé en arrière-plan !");
      // On invalide pour mettre à jour le statut
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });
};
