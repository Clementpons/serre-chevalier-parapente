import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.promocodes)[":id"]["$delete"]>;

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await client.api.promocodes[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["promocodes"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du code promo");
    },
  });

  return mutation;
};
