import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.promocodes)[":id"]["$put"]>;
type RequestType = InferRequestType<(typeof client.api.promocodes)[":id"]["$put"]>;

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.promocodes[":id"]["$put"]({
        param,
        json,
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
      toast.error("Erreur lors de la mise à jour du code promo");
    },
  });

  return mutation;
};
