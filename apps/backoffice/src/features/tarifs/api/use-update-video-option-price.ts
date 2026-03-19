import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { UpdateVideoOptionPriceInput } from "../schemas";

export const useUpdateVideoOptionPrice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: UpdateVideoOptionPriceInput) => {
      const response = await client.api.tarifs["video-option"].$put({
        json: values,
      });

      if (!response.ok) {
        throw new Error("Failed to update video option price");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Prix de l'option vidéo mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["video-option-price"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du prix de l'option vidéo");
    },
  });

  return mutation;
};