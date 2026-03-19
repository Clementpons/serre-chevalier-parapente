import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

interface RecordManualPaymentRequest {
  orderItemId: string;
  amount: number;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "CHECK";
  note?: string;
}

export const useRecordManualPayment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RecordManualPaymentRequest) => {
      const response = await client.api.reservations["manual-payment"].$post({
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record manual payment");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast.success("Paiement enregistré avec succès");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["reservation-details"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement du paiement");
    },
  });

  return mutation;
};