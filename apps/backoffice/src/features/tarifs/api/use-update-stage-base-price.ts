import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { UpdateStageBasePriceInput } from "../schemas";

export const useUpdateStageBasePrice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: UpdateStageBasePriceInput) => {
      const response = await client.api.tarifs.stages.base.$put({
        json: values,
      });

      if (!response.ok) {
        throw new Error("Failed to update stage base price");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Prix de base du stage mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["stage-base-prices"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du prix de base du stage");
    },
  });

  return mutation;
};