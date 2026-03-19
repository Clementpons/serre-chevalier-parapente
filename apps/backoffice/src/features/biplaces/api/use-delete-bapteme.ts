import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useDeleteBapteme = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await client.api.baptemes[":id"].$delete({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to delete bapteme");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to delete bapteme");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Baptême supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["baptemes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du baptême");
    },
  });

  return mutation;
};
