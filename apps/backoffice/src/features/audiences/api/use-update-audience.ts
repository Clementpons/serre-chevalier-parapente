import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateAudience } from "../schemas";

export function useUpdateAudience(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: UpdateAudience) => {
      const response = await fetch(`/api/audiences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'audience");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Audience mise à jour");
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Échec de la mise à jour");
    },
  });
}
