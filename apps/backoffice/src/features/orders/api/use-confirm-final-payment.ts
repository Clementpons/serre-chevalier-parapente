import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useConfirmFinalPayment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      orderItemId,
      note,
    }: {
      orderItemId: string;
      note?: string;
    }) => {
      const response = await client.api.orders.items[":orderItemId"].finalize.$post({
        param: { orderItemId },
        json: { note },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to confirm final payment");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Paiement final confirmé avec succès");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la confirmation du paiement final");
    },
  });

  return mutation;
};