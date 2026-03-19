import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de la suppression");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la suppression");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Campagne SMS supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });
};
