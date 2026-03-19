import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import type { CreateGiftVoucher } from "../schemas";

export const useCreateGiftVoucher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateGiftVoucher) => {
      const response = await client.api.giftvouchers.$post({
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create gift voucher");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Bon cadeau créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["giftvouchers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du bon cadeau");
    },
  });

  return mutation;
};