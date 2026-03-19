import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { BaptemeCategory } from "@/features/biplaces/schemas";

export const useUpdateBapteme = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      id: string;
      date: string;
      duration: number;
      places: number;
      moniteurIds: string[];
      categories: BaptemeCategory[];
      acomptePrice: number;
    }) => {
      const { id, ...rest } = data;
      const response = await client.api.baptemes[":id"].$put({
        param: { id },
        json: rest,
      });

      if (!response.ok) {
        throw new Error("Failed to update bapteme");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update bapteme");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Baptême mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["baptemes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du baptême");
    },
  });

  return mutation;
};
