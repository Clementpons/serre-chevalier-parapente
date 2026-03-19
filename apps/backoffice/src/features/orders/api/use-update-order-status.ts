import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["status"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["status"]["$patch"]
>;

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.orders[":id"]["status"]["$patch"]({
        param,
        json,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut de la commande");
    },
  });

  return mutation;
};
