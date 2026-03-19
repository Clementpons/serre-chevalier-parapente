import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders)["ghost"]["$delete"]
>;

export const useDeleteGhostOrders = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.orders["ghost"]["$delete"]();
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
      toast.error("Erreur lors du nettoyage des commandes fantômes");
    },
  });

  return mutation;
};
