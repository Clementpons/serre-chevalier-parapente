import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateCampaign } from "../schemas";
import { toast } from "sonner";

export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: UpdateCampaign) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la campagne");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Campagne mise à jour");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
