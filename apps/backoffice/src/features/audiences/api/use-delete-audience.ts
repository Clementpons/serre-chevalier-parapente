import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.audiences)[":id"]["$delete"]>;

export const useDeleteAudience = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const res = await client.api.audiences[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["audiences"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
};
