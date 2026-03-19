import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import type { UpdateTarifInput } from "../schemas";

export const useUpdateTarif = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: UpdateTarifInput) => {
      const response = await client.api.tarifs.$put({
        json: values,
      });

      if (!response.ok) {
        throw new Error("Failed to update tarif");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Tarif mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["tarifs"] });
      queryClient.invalidateQueries({ queryKey: ["tarif"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du tarif");
    },
  });

  return mutation;
};