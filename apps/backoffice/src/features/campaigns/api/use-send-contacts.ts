import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSendContacts(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phones: string[]) => {
      const response = await fetch(`/api/campaigns/${campaignId}/send-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones }),
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'envoi");

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Erreur lors de l'envoi");

      return result.data.results as { phone: string; success: boolean; error?: string }[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-resolve", campaignId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });
}
