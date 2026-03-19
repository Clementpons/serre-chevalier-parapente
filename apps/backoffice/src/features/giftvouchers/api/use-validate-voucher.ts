import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import type { ValidateVoucher } from "../schemas";

export const useValidateVoucher = () => {
  const mutation = useMutation({
    mutationFn: async (data: ValidateVoucher) => {
      const response = await client.api.giftvouchers.validate.$post({
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { message?: string }).message || "Failed to validate voucher");
      }

      return await response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la validation du bon cadeau");
    },
  });

  return mutation;
};