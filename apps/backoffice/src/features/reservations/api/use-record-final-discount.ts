import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

interface RecordFinalDiscountRequest {
  orderItemId: string;
  amount: number;
  note?: string;
}

export const useRecordFinalDiscount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RecordFinalDiscountRequest) => {
      const response = await client.api.reservations["final-discount"].$post({
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || "Failed to record final discount");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Réduction enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ["reservation-details"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement de la réduction");
    },
  });

  return mutation;
};
